import {
  WebsiteConfig,
  ProductivityMetrics,
  EvaluationResult,
  MetricWeight,
  MonitoringLog,
  ProductivityCriteria,
  SelectionConfig,
  WebsiteSelection,
  DEFAULT_CONFIG
} from './productivity-types';
import { generateId } from './utils';

let monitoringLogs: MonitoringLog[] = [];
let websiteConfigs: Map<string, WebsiteConfig> = new Map();
let currentSelection: WebsiteSelection | null = null;
let lastEvaluation: Date | null = null;

function logEvent(
  websiteId: string,
  event: MonitoringLog['event'],
  data?: Partial<MonitoringLog>
): void {
  const log: MonitoringLog = {
    id: generateId(),
    websiteId,
    timestamp: new Date(),
    event,
    ...data
  };
  monitoringLogs.push(log);
  if (monitoringLogs.length > 1000) {
    monitoringLogs = monitoringLogs.slice(-500);
  }
  console.log(`[ProductivityMonitor] ${event.toUpperCase()}: ${websiteId}`, data);
}

async function measureResponseTime(url: string): Promise<number> {
  const start = performance.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DEFAULT_CONFIG.maxResponseTimeMs);
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      cache: 'no-store'
    });
    clearTimeout(timeout);
    const end = performance.now();
    return Math.round(end - start);
  } catch (error) {
    return DEFAULT_CONFIG.maxResponseTimeMs + 1;
  }
}

async function checkUptime(url: string): Promise<{ available: boolean; uptime: number }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal
    });
    clearTimeout(timeout);
    return { available: response.ok, uptime: response.ok ? 100 : 0 };
  } catch {
    return { available: false, uptime: 0 };
  }
}

async function evaluateUserEngagement(url: string): Promise<number> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!response.ok) return 0;
    const text = await response.text();
    const hasInteractiveElements = (
      text.includes('comment') ||
      text.includes('share') ||
      text.includes('like') ||
      text.includes('subscribe') ||
      text.includes('button')
    );
    return hasInteractiveElements ? 70 + Math.random() * 30 : 40 + Math.random() * 30;
  } catch {
    return 0;
  }
}

async function evaluateContentFreshness(url: string): Promise<number> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!response.ok) return 0;
    const lastModified = response.headers.get('Last-Modified');
    if (!lastModified) return 50 + Math.random() * 50;
    const lastDate = new Date(lastModified);
    const now = Date.now();
    const lastTime = lastDate.getTime();
    const hoursSinceUpdate = (now - lastTime) / (1000 * 60 * 60);
    if (hoursSinceUpdate < 1) return 95 + Math.random() * 5;
    if (hoursSinceUpdate < 24) return 80 + Math.random() * 15;
    if (hoursSinceUpdate < 168) return 50 + Math.random() * 30;
    return Math.max(10, 100 - hoursSinceUpdate * 0.5);
  } catch {
    return 0;
  }
}

async function evaluateWebsite(config: WebsiteConfig): Promise<EvaluationResult> {
  const result: EvaluationResult = {
    websiteId: config.id,
    websiteName: config.name,
    url: config.url,
    score: 0,
    metrics: {
      responseTime: 0,
      uptimePercentage: 0,
      userEngagement: 0,
      contentFreshness: 0,
      lastChecked: new Date()
    },
    rank: 0,
    timestamp: new Date(),
    isAvailable: false
  };

  try {
    const [responseTime, { available, uptime }, engagement, freshness] = await Promise.all([
      measureResponseTime(config.url),
      checkUptime(config.url),
      evaluateUserEngagement(config.url),
      evaluateContentFreshness(config.url)
    ]);

    result.metrics = {
      responseTime,
      uptimePercentage: uptime,
      userEngagement: engagement,
      contentFreshness: freshness,
      lastChecked: new Date()
    };
    result.isAvailable = available;
    result.errorMessage = available ? undefined : 'Website unavailable';

    logEvent(config.id, available ? 'checked' : 'failed', {
      metrics: result.metrics,
      responseTime,
      error: available ? undefined : 'Website unavailable'
    });
  } catch (error) {
    result.errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logEvent(config.id, 'failed', { error: result.errorMessage });
  }

  return result;
}

function calculateScore(metrics: ProductivityMetrics, weights: MetricWeight[]): number {
  let totalScore = 0;

  for (const weight of weights) {
    const rawValue = metrics[weight.name];
    if (rawValue === undefined || rawValue === null) continue;
    const value = typeof rawValue === 'number' ? rawValue : rawValue.getTime();

    let normalizedValue: number;

    switch (weight.direction) {
      case 'higher':
        normalizedValue = Math.min(100, value);
        break;
      case 'lower':
        if (weight.optimalValue !== undefined && weight.optimalValue > 0) {
          normalizedValue = Math.max(0, 100 - ((value - weight.optimalValue) / weight.optimalValue) * 100);
        } else {
          normalizedValue = Math.max(0, 100 - (value / 10));
        }
        break;
      case 'optimal':
        if (weight.optimalValue !== undefined) {
          const deviation = Math.abs(value - weight.optimalValue);
          normalizedValue = Math.max(0, 100 - deviation);
        } else {
          normalizedValue = value;
        }
        break;
      default:
        normalizedValue = value;
    }

    totalScore += normalizedValue * weight.weight;
  }

  return Math.round(totalScore * 100) / 100;
}

export function rankResults(results: EvaluationResult[], weights: MetricWeight[]): EvaluationResult[] {
  for (const result of results) {
    if (result.isAvailable) {
      result.score = calculateScore(result.metrics, weights);
    } else {
      result.score = 0;
    }
  }

  return results.sort((a, b) => b.score - a.score).map((r, i) => ({ ...r, rank: i + 1 }));
}

export function selectBestWebsite(
  results: EvaluationResult[],
  enableFallback: boolean = true
): { primary: EvaluationResult | null; fallback: EvaluationResult | null } {
  const available = results.filter(r => r.isAvailable && r.score > 0);

  if (available.length === 0) {
    return { primary: null, fallback: null };
  }

  const primary = available[0];
  logEvent(primary.websiteId, 'selected', { score: primary.score });

  let fallback: EvaluationResult | null = null;
  if (enableFallback && available.length > 1) {
    fallback = available[1];
    logEvent(fallback.websiteId, 'fallback', { score: fallback.score });
  }

  return { primary, fallback };
}

export async function evaluateAllWebsites(
  configs: WebsiteConfig[],
  criteria: ProductivityCriteria
): Promise<WebsiteSelection> {
  const enabledConfigs = configs.filter(c => c.enabled);

  const results = await Promise.all(
    enabledConfigs.map(config => evaluateWebsite(config))
  );

  const rankedResults = rankResults(results, criteria.weights);
  const { primary, fallback } = selectBestWebsite(rankedResults, DEFAULT_CONFIG.enableFallback);

  currentSelection = {
    primary,
    fallback,
    allResults: rankedResults,
    timestamp: new Date(),
    nextEvaluation: new Date(Date.now() + DEFAULT_CONFIG.evaluationIntervalMs)
  };

  lastEvaluation = new Date();

  return currentSelection;
}

export function getCurrentSelection(): WebsiteSelection | null {
  return currentSelection;
}

export function getMonitoringLogs(limit: number = 100): MonitoringLog[] {
  return monitoringLogs.slice(-limit);
}

export function clearMonitoringLogs(): void {
  monitoringLogs = [];
  console.log('[ProductivityMonitor] Logs cleared');
}

export function registerWebsite(config: WebsiteConfig): void {
  websiteConfigs.set(config.id, config);
  console.log(`[ProductivityMonitor] Website registered: ${config.name} (${config.url})`);
}

export function unregisterWebsite(websiteId: string): boolean {
  const deleted = websiteConfigs.delete(websiteId);
  if (deleted) {
    console.log(`[ProductivityMonitor] Website unregistered: ${websiteId}`);
  }
  return deleted;
}

export function getRegisteredWebsites(): WebsiteConfig[] {
  return Array.from(websiteConfigs.values());
}

export function getLastEvaluation(): Date | null {
  return lastEvaluation;
}

export async function evaluateSingleWebsite(
  config: WebsiteConfig,
  criteria: ProductivityCriteria
): Promise<EvaluationResult> {
  const result = await evaluateWebsite(config);
  if (result.isAvailable) {
    result.score = calculateScore(result.metrics, criteria.weights);
  }
  const ranked = rankResults([result], criteria.weights);
  return ranked[0];
}

export function getWebsiteStatus(websiteId: string): {
  registered: boolean;
  lastResult?: EvaluationResult;
} {
  const registered = websiteConfigs.has(websiteId);
  const lastResult = currentSelection?.allResults.find(r => r.websiteId === websiteId);
  return { registered, lastResult };
}
