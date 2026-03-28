'use client';

import { Github } from 'lucide-react';
import styles from './Header.module.css';

interface HeaderProps {
  githubConnected?: boolean;
  githubUsername?: string;
  onGithubConnect?: () => void;
  onGithubDisconnect?: () => void;
}

export default function Header({
  githubConnected = false,
  githubUsername,
  onGithubConnect,
  onGithubDisconnect
}: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <div className={styles.logoMark} />
        <span className={styles.logoText}>Dev Reality</span>
        <span className={styles.logoSubtext}>Dashboard</span>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.githubBtn}
          onClick={githubConnected ? onGithubDisconnect : onGithubConnect}
        >
          <Github size={16} />
          {githubConnected ? (
            <span className={styles.githubUsername}>{githubUsername}</span>
          ) : (
            'Connect GitHub'
          )}
        </button>
      </div>
    </header>
  );
}
