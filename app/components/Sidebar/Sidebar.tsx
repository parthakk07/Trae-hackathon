'use client';

import { LayoutDashboard, Clock, Github, Brain, BarChart3, Settings } from 'lucide-react';
import styles from './Sidebar.module.css';

type NavSection = 'overview' | 'productivity' | 'github' | 'mood' | 'analytics' | 'settings';

interface SidebarProps {
  activeSection: NavSection;
  onNavigate: (section: NavSection) => void;
  tabSwitches?: number;
  streak?: number;
}

const navItems = [
  { id: 'overview' as NavSection, label: 'Overview', icon: LayoutDashboard },
  { id: 'productivity' as NavSection, label: 'Productivity', icon: Clock },
  { id: 'github' as NavSection, label: 'GitHub', icon: Github },
  { id: 'mood' as NavSection, label: 'Mood', icon: Brain },
  { id: 'analytics' as NavSection, label: 'Analytics', icon: BarChart3 },
  { id: 'settings' as NavSection, label: 'Settings', icon: Settings },
];

export default function Sidebar({ activeSection, onNavigate, tabSwitches = 0, streak = 0 }: SidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <nav>
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Menu</div>
          {navItems.slice(0, 1).map(item => (
            <button key={item.id} className={`${styles.navItem} ${activeSection === item.id ? styles.navItemActive : ''}`} onClick={() => onNavigate(item.id)}>
              <item.icon size={16} />
              <span className={styles.navLabel}>{item.label}</span>
            </button>
          ))}
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Tracking</div>
          {navItems.slice(1, 5).map(item => (
            <button key={item.id} className={`${styles.navItem} ${activeSection === item.id ? styles.navItemActive : ''}`} onClick={() => onNavigate(item.id)}>
              <item.icon size={16} />
              <span className={styles.navLabel}>{item.label}</span>
            </button>
          ))}
        </div>

        <div className={styles.divider} />

        <div className={styles.section}>
          {navItems.slice(5).map(item => (
            <button key={item.id} className={`${styles.navItem} ${activeSection === item.id ? styles.navItemActive : ''}`} onClick={() => onNavigate(item.id)}>
              <item.icon size={16} />
              <span className={styles.navLabel}>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className={styles.quickStats}>
        <div className={styles.quickStatsTitle}>Quick Stats</div>
        <div className={styles.statRow}>
          <span className={styles.statLabel}>Tab Switches</span>
          <span className={styles.statValue}>{tabSwitches}</span>
        </div>
        <div className={styles.statRow}>
          <span className={styles.statLabel}>Streak</span>
          <span className={styles.statValue}>{streak} days</span>
        </div>
      </div>
    </aside>
  );
}
