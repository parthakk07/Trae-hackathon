'use client';

import { useState } from 'react';
import styles from './SetupGuide.module.css';

interface GuideStep {
  id: string;
  title: string;
  content: string;
  tips?: string[];
}

interface GuideSection {
  id: string;
  title: string;
  steps: GuideStep[];
}

const setupGuideData: GuideSection[] = [
  {
    id: 'download',
    title: '1. Download Extension',
    steps: [
      {
        id: 'get-extension',
        title: 'Step 1: Get the Extension Folder',
        content: 'Download or copy the /extension folder from the Dev Reality Dashboard repository. This folder contains all the files needed for the Chrome extension.',
        tips: [
          'The extension folder is located at: /extension/',
          'It contains: manifest.json, background.js, content.js, and the /popup folder'
        ]
      },
      {
        id: 'extract-extension',
        title: 'Step 2: Extract to Location',
        content: 'Place the extension folder in an easily accessible location on your computer (e.g., Desktop or Documents). Keep the folder structure intact - do not move individual files.',
        tips: [
          'The folder must contain manifest.json at its root',
          'Do not rename the folder after loading in Chrome'
        ]
      }
    ]
  },
  {
    id: 'installation',
    title: '2. Installation',
    steps: [
      {
        id: 'open-chrome',
        title: 'Step 1: Open Chrome Extensions Page',
        content: 'Navigate to chrome://extensions in your Chrome browser. Make sure "Developer mode" is enabled by toggling the switch in the top right corner.',
        tips: [
          'Keyboard shortcut: Press Ctrl+Shift+E (Windows) or Cmd+Shift+E (Mac)',
          'Developer mode must be enabled to load unpacked extensions'
        ]
      },
      {
        id: 'load-unpacked',
        title: 'Step 2: Load Unpacked Extension',
        content: 'Click the "Load unpacked" button (top left area). A file dialog will appear. Navigate to where you placed the extension folder and select it.',
        tips: [
          'Important: Select the folder that contains manifest.json, not an individual file',
          'The correct folder path will show files like manifest.json, background.js'
        ]
      },
      {
        id: 'verify-extension',
        title: 'Step 3: Verify Installation',
        content: 'After loading, the extension icon should appear in your Chrome toolbar (puzzle piece icon area). Right-click the icon and select "Pin" for easy access.',
        tips: [
          'If the icon does not appear, click the puzzle piece icon to see all extensions',
          'You should see "Dev Reality" in the extensions list'
        ]
      }
    ]
  },
  {
    id: 'configuration',
    title: '3. Configuration',
    steps: [
      {
        id: 'open-popup',
        title: 'Step 1: Open Extension Popup',
        content: 'Click the Dev Reality Dashboard icon in your toolbar. The popup window will show your real-time tracking data. Click "Start Tracking" to begin monitoring your web usage.',
        tips: [
          'Data refreshes automatically every 30 seconds',
          'Click "Start Tracking" to begin monitoring your web usage'
        ]
      },
      {
        id: 'configure-sites',
        title: 'Step 2: Configure Productive Sites',
        content: 'In the popup, you will see your productive time, unproductive time, and tab switch count. The extension automatically categorizes websites based on built-in lists.',
        tips: [
          'Productive sites include: GitHub, Stack Overflow, documentation sites',
          'Unproductive sites include: YouTube, Twitter, Netflix, etc.'
        ]
      },
      {
        id: 'set-goals',
        title: 'Step 3: Monitor Your Stats',
        content: 'View your daily statistics directly in the popup: productive time, neutral time, unproductive time, and total tab switches. These update in real-time as you browse.',
        tips: [
          'Stats are grouped by day (midnight to midnight)',
          'Tab switches include both URL changes and tab switches between windows'
        ]
      }
    ]
  },
  {
    id: 'dashboard-connection',
    title: '4. Connect to Dashboard',
    steps: [
      {
        id: 'start-dashboard',
        title: 'Step 1: Start the Dashboard',
        content: 'Start the Dev Reality Dashboard web application on your local machine. The dashboard runs at http://localhost:3000 by default.',
        tips: [
          'Run: npm run dev in the project directory',
          'Make sure both extension and dashboard are in the same browser'
        ]
      },
      {
        id: 'auto-sync',
        title: 'Step 2: Automatic Data Sync',
        content: 'The extension automatically syncs tracking data to the dashboard via shared browser storage. When you open the dashboard with the extension running, data appears automatically.',
        tips: [
          'Data syncs every 30 seconds from extension',
          'Dashboard polls every 5 seconds for new data',
          'No additional configuration needed'
        ]
      },
      {
        id: 'verify-connection',
        title: 'Step 3: Verify Connection',
        content: 'In the dashboard, go to the Overview or Productivity tab. Your extension tracking data should appear alongside the GitHub and mood data. Look for the "Extension Connected" indicator.',
        tips: [
          'If data does not appear, refresh the dashboard page',
          'Make sure the extension popup is open (required for sync)',
          'Check browser console for any connection errors'
        ]
      },
      {
        id: 'standalone-mode',
        title: 'Using Extension Standalone',
        content: 'The extension works completely independently from the dashboard. All data is stored locally in Chrome. The dashboard simply reads and displays the same data.',
        tips: [
          'Extension does not require dashboard to be running',
          'Data persists even after closing the browser',
          'You can use either one without the other'
        ]
      }
    ]
  },
  {
    id: 'permissions',
    title: '5. Permissions & Privacy',
    steps: [
      {
        id: 'understand-permissions',
        title: 'Required Permissions Explained',
        content: 'The extension requires these permissions to function:',
        tips: [
          'tabs - Accesses tab information to track which sites you visit',
          'storage - Saves your settings and tracking data locally',
          'activeTab - Monitors the currently active tab for activity'
        ]
      },
      {
        id: 'privacy-considerations',
        title: 'Privacy Information',
        content: 'All data collected by this extension is stored exclusively in your browser using localStorage. No information is transmitted to external servers or third parties. Your productivity data remains completely private and under your control.',
        tips: [
          'You can delete all data at any time by clearing browser storage',
          'No analytics or tracking beacons are used',
          'Data is never sent to any server'
        ]
      }
    ]
  },
  {
    id: 'troubleshooting',
    title: '6. Troubleshooting',
    steps: [
      {
        id: 'extension-not-loading',
        title: 'Extension Not Loading',
        content: 'If the extension fails to load, first verify that manifest.json is valid JSON and all JavaScript files have no syntax errors. Check the Chrome extensions page for any error messages.',
        tips: [
          'Run JavaScript files through a linter to catch syntax errors',
          'Ensure all files referenced in manifest.json actually exist'
        ]
      },
      {
        id: 'data-not-tracking',
        title: 'Data Not Tracking',
        content: 'Ensure the extension is enabled (toggle in chrome://extensions) and that you have clicked "Start Tracking" in the popup. Refresh the webpage you want to track after starting the extension.',
        tips: [
          'Close and reopen the popup after starting tracking',
          'Check browser console (F12) for any error messages'
        ]
      },
      {
        id: 'dashboard-not-showing',
        title: 'Dashboard Not Showing Extension Data',
        content: 'If the dashboard does not display extension data: (1) Make sure the extension popup is open, (2) Refresh the dashboard page, (3) Verify both are running in the same browser session.',
        tips: [
          'The extension must have its popup open for sync to occur',
          'Try closing and reopening both the popup and dashboard',
          'Check that localStorage is not disabled in browser settings'
        ]
      },
      {
        id: 'clear-data',
        title: 'Clear Extension Data',
        content: 'To reset all tracking data while preserving settings: Open Chrome Extensions, find Dev Reality Dashboard, click "Details", then scroll to "Storage" and click "Clear storage".',
        tips: [
          'Warning: This will permanently delete all tracking history',
          'Your configured settings will be preserved'
        ]
      }
    ]
  }
];

const tableOfContents = [
  { id: 'download', title: '1. Download Extension' },
  { id: 'installation', title: '2. Installation' },
  { id: 'configuration', title: '3. Configuration' },
  { id: 'dashboard-connection', title: '4. Connect to Dashboard' },
  { id: 'permissions', title: '5. Permissions & Privacy' },
  { id: 'troubleshooting', title: '6. Troubleshooting' }
];

interface SetupGuideProps {
  onBack: () => void;
}

export default function SetupGuide({ onBack }: SetupGuideProps) {
  const [activeSection, setActiveSection] = useState<string>('installation');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set(['open-chrome']));

  const toggleStep = (stepId: string) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  const filteredSections = setupGuideData.map(section => ({
    ...section,
    steps: section.steps.filter(step =>
      step.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      step.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      step.tips?.some(tip => tip.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })).filter(section => section.steps.length > 0);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className={styles.setupGuide}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onBack}>
          ← Back to Settings
        </button>
        <h2 className={styles.title}>Extension Setup Guide</h2>
        <p className={styles.subtitle}>
          Complete guide to install, configure, and connect the Dev Reality Dashboard Chrome extension.
        </p>
      </div>

      <div className={styles.searchContainer}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search setup instructions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <span className={styles.searchIcon}>🔍</span>
      </div>

      <div className={styles.tocContainer}>
        <div className={styles.tocTitle}>Table of Contents</div>
        <nav className={styles.tocNav}>
          {tableOfContents.map(toc => (
            <button
              key={toc.id}
              className={`${styles.tocItem} ${activeSection === toc.id ? styles.tocItemActive : ''}`}
              onClick={() => scrollToSection(toc.id)}
            >
              {toc.title}
            </button>
          ))}
        </nav>
      </div>

      <div className={styles.content}>
        {filteredSections.map(section => (
          <div key={section.id} id={section.id} className={styles.section}>
            <h3 className={styles.sectionTitle}>{section.title}</h3>

            <div className={styles.steps}>
              {section.steps.map((step, index) => (
                <div key={step.id} className={styles.step}>
                  <div
                    className={styles.stepHeader}
                    onClick={() => toggleStep(step.id)}
                  >
                    <div className={styles.stepNumber}>{index + 1}</div>
                    <div className={styles.stepTitleContainer}>
                      <h4 className={styles.stepTitle}>{step.title}</h4>
                    </div>
                    <div className={styles.stepArrow}>
                      {expandedSteps.has(step.id) ? '▲' : '▼'}
                    </div>
                  </div>

                  {expandedSteps.has(step.id) && (
                    <div className={styles.stepContent}>
                      <p className={styles.stepDescription}>{step.content}</p>

                      {step.tips && step.tips.length > 0 && (
                        <div className={styles.tipsContainer}>
                          <div className={styles.tipsTitle}>Tips:</div>
                          <ul className={styles.tipsList}>
                            {step.tips.map((tip, i) => (
                              <li key={i} className={styles.tipItem}>{tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {filteredSections.length === 0 && (
          <div className={styles.noResults}>
            <p>No results found for "{searchQuery}"</p>
            <button
              className={styles.clearSearch}
              onClick={() => setSearchQuery('')}
            >
              Clear search
            </button>
          </div>
        )}
      </div>

      <div className={styles.supportSection}>
        <h3 className={styles.supportTitle}>Need Help?</h3>
        <p className={styles.supportText}>
          If you encounter issues not covered in this guide, please check the extension README or submit an issue on GitHub.
        </p>
        <div className={styles.supportLinks}>
          <a href="/extension/README-EXTENSION.md" className={styles.supportLink}>
            📖 Extension README
          </a>
          <a href="https://github.com/parthakk07/Trae-hackathon" className={styles.supportLink}>
            🐛 Report an Issue
          </a>
        </div>
      </div>
    </div>
  );
}
