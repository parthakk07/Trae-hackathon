import { ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function Card({ children, className = '', style }: CardProps) {
  return (
    <div className={`${styles.card} ${className}`} style={style}>
      {children}
    </div>
  );
}
