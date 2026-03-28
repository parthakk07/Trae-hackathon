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
    id: 'installation',
    title: '1. Installation',
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
        content: 'Click the "Load unpacked" button (top left area). A file dialog will appear. Navigate to the Dev Reality Dashboard project folder and select the /extension subfolder.',
        tips: [
          'Important: Select the folder that contains manifest.json, not the project root',
          'The folder path should end with /extension'
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
    title: '2. Configuration',
    steps: [
      {
        id: 'open-popup',
        title: 'Step 1: Open Extension Popup',
        content: 'Click the Dev Reality Dashboard icon in your toolbar. The popup window will show your real-time tracking data. Look for the "Start Tracking" button to begin monitoring.',
        tips: [
          'Data refreshes automatically every 30 seconds',
          'Click "Start Tracking" to begin monitoring your web usage'
        ]
      },
      {
        id: 'configure-sites',
        title: 'Step 2: Configure Productive Sites',
        content: 'In the popup, navigate to Settings. Add URLs of websites you consider productive such as github.com, stackoverflow.com, and developer documentation sites. These will be categorized as productive time.',
        tips: [
          'Enter domains without https:// (e.g., github.com)',
          'Separate multiple sites with commas'
        ]
      },
      {
        id: 'set-goals',
        title: 'Step 3: Set Daily Goals',
        content: 'Configure your daily productive hours target and maximum tab switch limit. The extension will provide visual alerts when you approach or exceed these limits.',
        tips: [
          'Recommended: Start with 4-6 hours of daily productive time',
          'Tab switch limit suggestion: 20-30 switches per hour indicates good focus'
        ]
      }
    ]
  },
  {
    id: 'permissions',
    title: '3. Permissions',
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
          'No analytics or tracking beacons are used'
        ]
      }
    ]
  },
  {
    id: 'troubleshooting',
    title: '4. Troubleshooting',
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
  { id: 'installation', title: '1. Installation' },
  { id: 'configuration', title: '2. Configuration' },
  { id: 'permissions', title: '3. Permissions' },
  { id: 'troubleshooting', title: '4. Troubleshooting' }
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
          Follow these step-by-step instructions to install and configure the Dev Reality Dashboard Chrome extension.
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
