import {
  ProductivityMetrics,
  MetricWeight,
  WebsiteConfig,
  EvaluationResult,
  ProductivityCriteria,
  DEFAULT_WEIGHTS,
  validateWeights,
  normalizeWeights,
  createCriteria
} from './productivity-types';

import {
  rankResults,
  selectBestWebsite,
  calculateScore
} from './productivity-engine';

describe('Productivity Types', () => {
  describe('validateWeights', () => {
    it('should return true for weights totaling 1', () => {
      const weights: MetricWeight[] = [
        { name: 'responseTime', weight: 0.3, direction: 'lower' },
        { name: 'uptimePercentage', weight: 0.3, direction: 'higher' },
        { name: 'userEngagement', weight: 0.2, direction: 'higher' },
        { name: 'contentFreshness', weight: 0.2, direction: 'higher' }
      ];
      expect(validateWeights(weights)).toBe(true);
    });

    it('should return true for weights totaling 0', () => {
      const weights: MetricWeight[] = [];
      expect(validateWeights(weights)).toBe(true);
    });

    it('should return false for weights not totaling 1', () => {
      const weights: MetricWeight[] = [
        { name: 'responseTime', weight: 0.5, direction: 'lower' },
        { name: 'uptimePercentage', weight: 0.3, direction: 'higher' }
      ];
      expect(validateWeights(weights)).toBe(false);
    });

    it('should tolerate small floating point errors', () => {
      const weights: MetricWeight[] = [
        { name: 'responseTime', weight: 0.333, direction: 'lower' },
        { name: 'uptimePercentage', weight: 0.333, direction: 'higher' },
        { name: 'userEngagement', weight: 0.334, direction: 'higher' }
      ];
      expect(validateWeights(weights)).toBe(true);
    });
  });

  describe('normalizeWeights', () => {
    it('should normalize weights to sum to 1', () => {
      const weights: MetricWeight[] = [
        { name: 'responseTime', weight: 30, direction: 'lower' },
        { name: 'uptimePercentage', weight: 30, direction: 'higher' },
        { name: 'userEngagement', weight: 20, direction: 'higher' },
        { name: 'contentFreshness', weight: 20, direction: 'higher' }
      ];
      const normalized = normalizeWeights(weights);
      const total = normalized.reduce((sum, w) => sum + w.weight, 0);
      expect(total).toBe(1);
    });

    it('should preserve weight ratios', () => {
      const weights: MetricWeight[] = [
        { name: 'responseTime', weight: 60, direction: 'lower' },
        { name: 'uptimePercentage', weight: 40, direction: 'higher' }
      ];
      const normalized = normalizeWeights(weights);
      expect(normalized[0].weight).toBe(0.6);
      expect(normalized[1].weight).toBe(0.4);
    });

    it('should handle zero total weight', () => {
      const weights: MetricWeight[] = [];
      const normalized = normalizeWeights(weights);
      expect(normalized).toEqual([]);
    });
  });

  describe('createCriteria', () => {
    it('should create criteria with given parameters', () => {
      const weights: MetricWeight[] = DEFAULT_WEIGHTS;
      const criteria = createCriteria('Test Criteria', 'Test Description', weights);

      expect(criteria.id).toMatch(/^criteria-\d+$/);
      expect(criteria.name).toBe('Test Criteria');
      expect(criteria.description).toBe('Test Description');
      expect(criteria.weights).toBe(weights);
      expect(criteria.isActive).toBe(true);
      expect(criteria.createdAt).toBeInstanceOf(Date);
      expect(criteria.updatedAt).toBeInstanceOf(Date);
    });
  });
});

describe('calculateScore', () => {
  const baseMetrics: ProductivityMetrics = {
    responseTime: 100,
    uptimePercentage: 100,
    userEngagement: 100,
    contentFreshness: 100,
    lastChecked: new Date()
  };

  it('should return 100 for perfect metrics', () => {
    const score = calculateScore(baseMetrics, DEFAULT_WEIGHTS);
    expect(score).toBe(100);
  });

  it('should return 0 for all zero metrics', () => {
    const zeroMetrics: ProductivityMetrics = {
      responseTime: 0,
      uptimePercentage: 0,
      userEngagement: 0,
      contentFreshness: 0,
      lastChecked: new Date()
    };
    const score = calculateScore(zeroMetrics, DEFAULT_WEIGHTS);
    expect(score).toBe(0);
  });

  it('should handle partial metrics', () => {
    const partialMetrics: ProductivityMetrics = {
      responseTime: 100,
      uptimePercentage: 50,
      userEngagement: 0,
      contentFreshness: 0,
      lastChecked: new Date()
    };
    const score = calculateScore(partialMetrics, DEFAULT_WEIGHTS);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(100);
  });

  it('should handle missing metrics', () => {
    const partialMetrics = {
      responseTime: 100,
      uptimePercentage: 100,
      lastChecked: new Date()
    } as ProductivityMetrics;
    const score = calculateScore(partialMetrics, DEFAULT_WEIGHTS);
    expect(score).toBeGreaterThan(0);
  });
});

describe('rankResults', () => {
  it('should rank websites by score descending', () => {
    const results: EvaluationResult[] = [
      createMockResult('site1', 50, true),
      createMockResult('site2', 100, true),
      createMockResult('site3', 75, true)
    ];

    const ranked = rankResults(results, DEFAULT_WEIGHTS);

    expect(ranked[0].websiteId).toBe('site2');
    expect(ranked[0].rank).toBe(1);
    expect(ranked[1].websiteId).toBe('site3');
    expect(ranked[1].rank).toBe(2);
    expect(ranked[2].websiteId).toBe('site1');
    expect(ranked[2].rank).toBe(3);
  });

  it('should rank unavailable websites last', () => {
    const results: EvaluationResult[] = [
      createMockResult('site1', 100, true),
      createMockResult('site2', 0, false),
      createMockResult('site3', 100, true)
    ];

    const ranked = rankResults(results, DEFAULT_WEIGHTS);

    expect(ranked[0].websiteId).toBe('site1');
    expect(ranked[1].websiteId).toBe('site3');
    expect(ranked[2].websiteId).toBe('site2');
    expect(ranked[2].score).toBe(0);
  });

  it('should handle empty results', () => {
    const ranked = rankResults([], DEFAULT_WEIGHTS);
    expect(ranked).toEqual([]);
  });

  it('should handle single website', () => {
    const results = [createMockResult('site1', 85, true)];
    const ranked = rankResults(results, DEFAULT_WEIGHTS);
    expect(ranked.length).toBe(1);
    expect(ranked[0].rank).toBe(1);
  });
});

describe('selectBestWebsite', () => {
  it('should select highest scoring available website as primary', () => {
    const results: EvaluationResult[] = [
      createMockResult('site1', 60, true),
      createMockResult('site2', 100, true),
      createMockResult('site3', 80, true)
    ];

    const { primary, fallback } = selectBestWebsite(results, true);

    expect(primary?.websiteId).toBe('site2');
    expect(fallback?.websiteId).toBe('site3');
  });

  it('should select second highest as fallback when enabled', () => {
    const results: EvaluationResult[] = [
      createMockResult('site1', 100, true),
      createMockResult('site2', 80, true)
    ];

    const { primary, fallback } = selectBestWebsite(results, true);

    expect(primary?.websiteId).toBe('site1');
    expect(fallback?.websiteId).toBe('site2');
  });

  it('should return null when no websites available', () => {
    const results: EvaluationResult[] = [
      createMockResult('site1', 0, false),
      createMockResult('site2', 0, false)
    ];

    const { primary, fallback } = selectBestWebsite(results, true);

    expect(primary).toBeNull();
    expect(fallback).toBeNull();
  });

  it('should not select fallback when only one available', () => {
    const results: EvaluationResult[] = [
      createMockResult('site1', 100, true),
      createMockResult('site2', 50, false)
    ];

    const { primary, fallback } = selectBestWebsite(results, true);

    expect(primary?.websiteId).toBe('site1');
    expect(fallback).toBeNull();
  });

  it('should not select fallback when disabled', () => {
    const results: EvaluationResult[] = [
      createMockResult('site1', 100, true),
      createMockResult('site2', 80, true)
    ];

    const { primary, fallback } = selectBestWebsite(results, false);

    expect(primary?.websiteId).toBe('site1');
    expect(fallback).toBeNull();
  });
});

describe('Edge Cases', () => {
  it('should handle websites with same score', () => {
    const results: EvaluationResult[] = [
      createMockResult('site1', 100, true),
      createMockResult('site2', 100, true)
    ];

    const ranked = rankResults(results, DEFAULT_WEIGHTS);

    expect(ranked.length).toBe(2);
  });

  it('should handle extremely high response times', () => {
    const highResponseMetrics: ProductivityMetrics = {
      responseTime: 10000,
      uptimePercentage: 100,
      userEngagement: 100,
      contentFreshness: 100,
      lastChecked: new Date()
    };

    const score = calculateScore(highResponseMetrics, DEFAULT_WEIGHTS);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(100);
  });

  it('should handle negative values in metrics', () => {
    const negativeMetrics: ProductivityMetrics = {
      responseTime: -100,
      uptimePercentage: 100,
      userEngagement: 100,
      contentFreshness: 100,
      lastChecked: new Date()
    };

    const score = calculateScore(negativeMetrics, DEFAULT_WEIGHTS);
    expect(score).toBeGreaterThanOrEqual(0);
  });

  it('should handle custom weights with different directions', () => {
    const customWeights: MetricWeight[] = [
      { name: 'responseTime', weight: 0.5, direction: 'lower', optimalValue: 50 },
      { name: 'uptimePercentage', weight: 0.5, direction: 'higher' }
    ];

    const goodMetrics: ProductivityMetrics = {
      responseTime: 50,
      uptimePercentage: 100,
      userEngagement: 0,
      contentFreshness: 0,
      lastChecked: new Date()
    };

    const badMetrics: ProductivityMetrics = {
      responseTime: 200,
      uptimePercentage: 100,
      userEngagement: 0,
      contentFreshness: 0,
      lastChecked: new Date()
    };

    const goodScore = calculateScore(goodMetrics, customWeights);
    const badScore = calculateScore(badMetrics, customWeights);

    expect(goodScore).toBeGreaterThan(badScore);
  });
});

function createMockResult(id: string, score: number, available: boolean): EvaluationResult {
  return {
    websiteId: id,
    websiteName: `Website ${id}`,
    url: `https://${id}.com`,
    score: available ? score : 0,
    metrics: {
      responseTime: available ? 100 : 0,
      uptimePercentage: available ? 100 : 0,
      userEngagement: available ? 80 : 0,
      contentFreshness: available ? 90 : 0,
      lastChecked: new Date()
    },
    rank: 0,
    timestamp: new Date(),
    isAvailable: available
  };
}
