export interface ProductivityMetrics {
  responseTime: number;
  uptimePercentage: number;
  userEngagement: number;
  contentFreshness: number;
  lastChecked: Date;
}

export interface WebsiteConfig {
  id: string;
  name: string;
  url: string;
  category: 'productive' | 'neutral' | 'unproductive';
  enabled: boolean;
  priority: number;
  fallbackUrls: string[];
  metadata: Record<string, string>;
}

export interface MetricWeight {
  name: keyof ProductivityMetrics;
  weight: number;
  direction: 'higher' | 'lower' | 'optimal';
  optimalValue?: number;
}

export interface EvaluationResult {
  websiteId: string;
  websiteName: string;
  url: string;
  score: number;
  metrics: ProductivityMetrics;
  rank: number;
  timestamp: Date;
  isAvailable: boolean;
  errorMessage?: string;
}

export interface ProductivityCriteria {
  id: string;
  name: string;
  description: string;
  weights: MetricWeight[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MonitoringLog {
  id: string;
  websiteId: string;
  timestamp: Date;
  event: 'checked' | 'failed' | 'recovered' | 'selected' | 'fallback';
  metrics?: ProductivityMetrics;
  score?: number;
  error?: string;
  responseTime?: number;
}

export interface SelectionConfig {
  evaluationIntervalMs: number;
  maxResponseTimeMs: number;
  minUptimePercentage: number;
  enableFallback: boolean;
  fallbackDelayMs: number;
  maxRetries: number;
  criteria: ProductivityCriteria;
}

export interface WebsiteSelection {
  primary: EvaluationResult | null;
  fallback: EvaluationResult | null;
  allResults: EvaluationResult[];
  timestamp: Date;
  nextEvaluation: Date;
}

const DEFAULT_WEIGHTS: MetricWeight[] = [
  { name: 'responseTime', weight: 0.3, direction: 'lower', optimalValue: 100 },
  { name: 'uptimePercentage', weight: 0.25, direction: 'higher' },
  { name: 'userEngagement', weight: 0.25, direction: 'higher' },
  { name: 'contentFreshness', weight: 0.2, direction: 'higher' }
];

const DEFAULT_CONFIG: SelectionConfig = {
  evaluationIntervalMs: 300000,
  maxResponseTimeMs: 5000,
  minUptimePercentage: 95,
  enableFallback: true,
  fallbackDelayMs: 1000,
  maxRetries: 3,
  criteria: {
    id: 'default',
    name: 'Default Productivity',
    description: 'Standard productivity criteria for evaluating websites',
    weights: DEFAULT_WEIGHTS,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
};

export function createDefaultCriteria(): ProductivityCriteria {
  return {
    ...DEFAULT_CONFIG.criteria,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

export function createCriteria(
  name: string,
  description: string,
  weights: MetricWeight[]
): ProductivityCriteria {
  return {
    id: `criteria-${Date.now()}`,
    name,
    description,
    weights,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

export function validateWeights(weights: MetricWeight[]): boolean {
  const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
  return Math.abs(totalWeight - 1) < 0.001;
}

export function normalizeWeights(weights: MetricWeight[]): MetricWeight[] {
  const total = weights.reduce((sum, w) => sum + w.weight, 0);
  if (total === 0) return weights;
  return weights.map(w => ({
    ...w,
    weight: w.weight / total
  }));
}

export {
  DEFAULT_WEIGHTS,
  DEFAULT_CONFIG
};
