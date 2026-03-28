'use client';

import { useState, useEffect } from 'react';
import { Github } from 'lucide-react';
import Header from '@/app/components/Header/Header';
import Sidebar from '@/app/components/Sidebar/Sidebar';
import Overview from '@/app/components/Overview/Overview';
import Productivity from '@/app/components/Productivity/Productivity';
import GitHubGrowth from '@/app/components/GitHubGrowth/GitHubGrowth';
import MoodDetector from '@/app/components/MoodDetector/MoodDetector';
import TimeAnalysis from '@/app/components/TimeAnalysis/TimeAnalysis';
import SetupGuide from '@/app/components/SetupGuide/SetupGuide';
import { generateMockGitHubData } from '@/lib/utils';
import { fetchGitHubData } from '@/lib/github';
import { GitHubData, MoodEntry, DashboardStats } from '@/lib/types';
import styles from './page.module.css';

type NavSection = 'overview' | 'productivity' | 'github' | 'mood' | 'analytics' | 'settings';

const sectionTitles: Record<NavSection, { title: string; subtitle: string }> = {
  overview: { title: 'Overview', subtitle: 'Your coding reality at a glance' },
  productivity: { title: 'Productivity', subtitle: 'Track your time and stay focused' },
  github: { title: 'GitHub', subtitle: 'Visualize your contributions and growth' },
  mood: { title: 'Mood', subtitle: 'Analyze your coding mood from commits' },
  analytics: { title: 'Analytics', subtitle: 'Understand your coding patterns' },
  settings: { title: 'Settings', subtitle: 'Configure your dashboard' },
};

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState<NavSection>('overview');
  const [showGithubModal, setShowGithubModal] = useState(false);
  const [githubConnected, setGithubConnected] = useState(false);
  const [githubUsername, setGithubUsername] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [githubData, setGithubData] = useState<GitHubData | undefined>();
  const [githubError, setGithubError] = useState<string | null>(null);
  const [currentMood] = useState<MoodEntry>({
    date: new Date(),
    mood: 'focused',
    confidence: 78
  });

  const stats: DashboardStats = {
    productiveTimeToday: 385,
    productiveTimeWeek: 1845,
    focusScore: 72,
    currentMood: 'focused',
    tabSwitchesToday: 23,
    procrastinationTime: 45,
    streakDays: 12
  };

  useEffect(() => {
    const savedUsername = localStorage.getItem('github-username');
    const savedToken = localStorage.getItem('github-token');
    if (savedUsername) {
      setGithubUsername(savedUsername);
      setGithubConnected(true);
      if (savedToken) {
        setGithubToken(savedToken);
        fetchRealGitHubData(savedUsername, savedToken);
      } else {
        setGithubData(generateMockGitHubData(savedUsername));
      }
    }
  }, []);

  const fetchRealGitHubData = async (username: string, token?: string) => {
    setGithubError(null);
    const data = await fetchGitHubData(token, username, (error) => {
      setGithubError(error.message);
    });
    if (data) {
      setGithubData(data);
    } else if (!githubError) {
      setGithubData(generateMockGitHubData(username));
    }
  };

  const handleGithubSubmit = async () => {
    if (githubUsername) {
      localStorage.setItem('github-username', githubUsername);
      if (githubToken) {
        localStorage.setItem('github-token', githubToken);
      }
      setGithubConnected(true);
      await fetchRealGitHubData(githubUsername, githubToken);
      setShowGithubModal(false);
    }
  };

  const handleGithubDisconnect = () => {
    localStorage.removeItem('github-username');
    localStorage.removeItem('github-token');
    setGithubConnected(false);
    setGithubUsername('');
    setGithubToken('');
    setGithubData(undefined);
  };

  const handleDemoMode = () => {
    const demoUsername = 'demo-developer';
    setGithubUsername(demoUsername);
    setGithubConnected(true);
    localStorage.setItem('github-username', demoUsername);
    setGithubData(generateMockGitHubData(demoUsername));
    setShowGithubModal(false);
  };

  const [showSetupGuide, setShowSetupGuide] = useState(false);

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <Overview stats={stats} githubData={githubData} currentMood={currentMood} />;
      case 'productivity':
        return <Productivity productiveTime={stats.productiveTimeToday} tabSwitches={stats.tabSwitchesToday} procrastinationTime={stats.procrastinationTime} />;
      case 'github':
        return <GitHubGrowth data={githubData} />;
      case 'mood':
        return <MoodDetector currentMood={currentMood} githubData={githubData} />;
      case 'analytics':
        return <TimeAnalysis />;
      case 'settings':
        if (showSetupGuide) {
          return <SetupGuide onBack={() => setShowSetupGuide(false)} />;
        }
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ background: '#ffffff', border: '1px solid #d0d7de', borderRadius: '8px', padding: '24px' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2328', marginBottom: '16px' }}>GitHub Connection</div>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', color: '#8c959f', marginBottom: '4px' }}>Status</div>
                <div style={{ fontSize: '13px', color: githubConnected ? '#1f2328' : '#8c959f' }}>
                  {githubConnected ? `Connected as ${githubUsername}` : 'Not connected'}
                </div>
              </div>
              {githubConnected && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', color: '#8c959f', marginBottom: '4px' }}>Contributions</div>
                  <div style={{ fontSize: '13px', color: '#1f2328', fontFamily: 'JetBrains Mono' }}>
                    {githubData?.totalContributions || 0} total
                  </div>
                </div>
              )}
              <button
                onClick={githubConnected ? handleGithubDisconnect : () => setShowGithubModal(true)}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  background: '#1f2328',
                  border: '1px solid #1f2328',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Github size={14} />
                {githubConnected ? 'Disconnect' : 'Connect GitHub'}
              </button>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #d0d7de', borderRadius: '8px', padding: '24px' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2328', marginBottom: '16px' }}>Chrome Extension</div>
              <div style={{ fontSize: '13px', color: '#656d76', marginBottom: '16px' }}>
                Install the Chrome extension to track web usage and tab switches in real-time.
              </div>
              <div style={{ fontSize: '12px', color: '#656d76', padding: '12px', background: '#f6f8fa', borderRadius: '6px', marginBottom: '12px' }}>
                Extension folder: <code style={{ fontFamily: 'JetBrains Mono' }}>/extension</code>
              </div>
              <button
                onClick={() => setShowSetupGuide(true)}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  background: '#1f2328',
                  border: '1px solid #1f2328',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                View Setup Guide
              </button>
            </div>
          </div>
        );
      default:
        return <Overview stats={stats} githubData={githubData} currentMood={currentMood} />;
    }
  };

  return (
      <div className={styles.dashboard}>
        <Header
          githubConnected={githubConnected}
          githubUsername={githubUsername}
          onGithubConnect={() => setShowGithubModal(true)}
          onGithubDisconnect={handleGithubDisconnect}
        />
        <Sidebar
          activeSection={activeSection}
          onNavigate={setActiveSection}
          tabSwitches={stats.tabSwitchesToday}
          streak={githubData?.currentStreak || stats.streakDays}
        />
        <main className={styles.main}>
          <div className={styles.content}>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>{sectionTitles[activeSection].title}</h1>
              <p className={styles.pageSubtitle}>{sectionTitles[activeSection].subtitle}</p>
            </div>
            {renderContent()}
          </div>
        </main>

        {showGithubModal && (
          <div className={styles.githubModal} onClick={() => setShowGithubModal(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalTitle}>Connect GitHub</div>
              <p className={styles.modalDescription}>
                Enter your GitHub username to fetch your contribution data.
              </p>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>GitHub Username</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="octocat"
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Personal Access Token (optional)</label>
                <input
                  type="password"
                  className={styles.input}
                  placeholder="ghp_xxxxxxxxxxxx"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                />
              </div>
              {githubError && (
                <div style={{
                  padding: '10px 12px',
                  background: '#fef2f2',
                  border: '1px solid #d0d7de',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: '#1f2328',
                  marginBottom: '16px'
                }}>
                  {githubError}
                </div>
              )}
              <div className={styles.modalActions}>
                <button
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '500',
                    background: '#ffffff',
                    border: '1px solid #d0d7de',
                    color: '#1f2328',
                    cursor: 'pointer'
                  }}
                  onClick={() => setShowGithubModal(false)}
                >
                  Cancel
                </button>
                <button
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '500',
                    background: '#1f2328',
                    border: '1px solid #1f2328',
                    color: '#ffffff',
                    cursor: 'pointer',
                    opacity: !githubUsername ? 0.5 : 1
                  }}
                  onClick={handleGithubSubmit}
                  disabled={!githubUsername}
                >
                  <Github size={14} style={{ marginRight: '6px' }} />
                  Connect
                </button>
              </div>
              <button
                style={{
                  width: '100%',
                  marginTop: '12px',
                  padding: '10px 16px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '500',
                  background: '#f6f8fa',
                  border: '1px solid #d0d7de',
                  color: '#1f2328',
                  cursor: 'pointer'
                }}
                onClick={handleDemoMode}
              >
                Try Demo Mode
              </button>
            </div>
          </div>
        )}
      </div>
    );
}
