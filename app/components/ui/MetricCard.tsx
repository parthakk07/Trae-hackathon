'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import styles from './MetricCard.module.css';

interface MetricCardProps {
  value: string | number;
  label: string;
  subtitle?: string;
  trend?: number;
  delay?: number;
}

export default function MetricCard({
  value,
  label,
  subtitle,
  trend,
  delay = 0
}: MetricCardProps) {
  return (
    <div className={styles.metricCard} style={{ animationDelay: `${delay}ms` }}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        {trend !== undefined && (
          <span className={`${styles.trend} ${trend >= 0 ? styles.trendUp : styles.trendDown}`}>
            {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className={styles.value}>{value}</div>
      {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
    </div>
  );
}
