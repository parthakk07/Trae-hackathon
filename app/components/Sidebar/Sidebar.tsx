'use client';

import { useState, useEffect, useCallback } from 'react';
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
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const handleNavClick = useCallback((section: NavSection) => {
    onNavigate(section);
    if (isMobile) {
      setIsOpen(false);
    }
  }, [onNavigate, isMobile]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      setIsOpen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, isMobile]);

  return (
    <>
      <button
        className={`${styles.hamburger} ${isOpen ? styles.hamburgerOpen : ''}`}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isOpen}
        aria-controls="sidebar-nav"
        type="button"
      >
        <span className={styles.hamburgerLine} />
        <span className={styles.hamburgerLine} />
        <span className={styles.hamburgerLine} />
      </button>

      {isOpen && isMobile && (
        <div
          className={styles.overlay}
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        id="sidebar-nav"
        className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <nav>
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Menu</div>
            {navItems.slice(0, 1).map(item => (
              <button
                key={item.id}
                className={`${styles.navItem} ${activeSection === item.id ? styles.navItemActive : ''}`}
                onClick={() => handleNavClick(item.id)}
                aria-current={activeSection === item.id ? 'page' : undefined}
              >
                <item.icon size={16} />
                <span className={styles.navLabel}>{item.label}</span>
              </button>
            ))}
          </div>

          <div className={styles.section}>
            <div className={styles.sectionTitle}>Tracking</div>
            {navItems.slice(1, 5).map(item => (
              <button
                key={item.id}
                className={`${styles.navItem} ${activeSection === item.id ? styles.navItemActive : ''}`}
                onClick={() => handleNavClick(item.id)}
                aria-current={activeSection === item.id ? 'page' : undefined}
              >
                <item.icon size={16} />
                <span className={styles.navLabel}>{item.label}</span>
              </button>
            ))}
          </div>

          <div className={styles.divider} />

          <div className={styles.section}>
            {navItems.slice(5).map(item => (
              <button
                key={item.id}
                className={`${styles.navItem} ${activeSection === item.id ? styles.navItemActive : ''}`}
                onClick={() => handleNavClick(item.id)}
                aria-current={activeSection === item.id ? 'page' : undefined}
              >
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
    </>
  );
}
