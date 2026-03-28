const PRODUCTIVE_SITES = [
  'github.com', 'gitlab.com', 'bitbucket.org',
  'stackoverflow.com', 'stackblitz.com', 'codesandbox.io',
  'docs.', 'developer.', 'api.',
  'medium.com', 'dev.to', 'hashnode.com',
  'notion.so', 'figma.com', 'excalidraw.com',
  'aws.amazon.com', 'vercel.com', 'netlify.com', 'cloudflare.com',
  'reactjs.org', 'vuejs.org', 'angular.io', 'svelte.dev',
  'typescriptlang.org', 'python.org', 'rust-lang.org', 'go.dev',
  'npmjs.com', 'yarnpkg.com', 'pnpm.io',
  'leetcode.com', 'hackerrank.com', 'codewars.com',
  'git-scm.com', 'docker.com', 'kubernetes.io'
];

const UNPRODUCTIVE_SITES = [
  'youtube.com', 'youtu.be',
  'twitter.com', 'x.com',
  'facebook.com', 'instagram.com',
  'tiktok.com', 'snapchat.com',
  'reddit.com', 'redd.it',
  '9gag.com', 'buzzfeed.com',
  'netflix.com', 'hulu.com', 'disneyplus.com',
  'twitch.tv', 'kick.com',
  'discord.com', 'slack.com', 'teams.microsoft.com',
  'spotify.com', 'soundcloud.com',
  'mail.google.com', 'gmail.com',
  'news.', 'cnn.com', 'bbc.com', 'foxnews.com'
];

let currentTab = null;
let tabSwitchCount = 0;
let activeTabStartTime = null;
let todayDate = new Date().toDateString();

const defaultDailyStats = {
  productive: 0,
  neutral: 0,
  unproductive: 0,
  tabSwitches: 0,
  lastUpdate: Date.now()
};

function categorizeWebsite(url) {
  if (!url || url.startsWith('chrome://') || url.startsWith('about:')) {
    return 'neutral';
  }
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    for (const site of PRODUCTIVE_SITES) {
      if (hostname.includes(site)) return 'productive';
    }
    for (const site of UNPRODUCTIVE_SITES) {
      if (hostname.includes(site)) return 'unproductive';
    }
    return 'neutral';
  } catch {
    return 'neutral';
  }
}

function getTodayStats() {
  const today = new Date().toDateString();
  if (today !== todayDate) {
    todayDate = today;
    return { ...defaultDailyStats };
  }
  return null;
}

function updateDailyStats(category, durationMinutes) {
  chrome.storage.local.get(['dailyStats'], (result) => {
    let stats = result.dailyStats || { ...defaultDailyStats };
    const today = new Date().toDateString();

    if (stats.date !== today) {
      stats = { ...defaultDailyStats, date: today };
    }

    if (category === 'productive') {
      stats.productive += durationMinutes;
    } else if (category === 'unproductive') {
      stats.unproductive += durationMinutes;
    } else {
      stats.neutral += durationMinutes;
    }

    stats.lastUpdate = Date.now();
    chrome.storage.local.set({ dailyStats: stats });
  });
}

function initializeStorage() {
  chrome.storage.local.get(['tabSwitchCount', 'dailyStats', 'isTracking'], (result) => {
    if (result.isTracking === undefined) {
      chrome.storage.local.set({
        tabSwitchCount: 0,
        dailyStats: { ...defaultDailyStats, date: new Date().toDateString() },
        isTracking: true
      });
    }
  });
}

chrome.runtime.onInstalled.addListener(() => {
  initializeStorage();
});

chrome.runtime.onStartup.addListener(() => {
  initializeStorage();
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);

    if (currentTab && activeTabStartTime && currentTab.url) {
      const duration = Date.now() - activeTabStartTime;
      const durationMinutes = Math.floor(duration / 60000);
      const category = categorizeWebsite(currentTab.url);

      if (durationMinutes > 0) {
        updateDailyStats(category, durationMinutes);
      }
    }

    tabSwitchCount++;
    currentTab = {
      id: tab.id,
      url: tab.url,
      title: tab.title
    };
    activeTabStartTime = Date.now();

    chrome.storage.local.set({ tabSwitchCount, currentTab: currentTab });
  } catch (error) {
    console.error('Tab activation error:', error);
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url && currentTab && currentTab.id === tabId) {
    if (activeTabStartTime) {
      const duration = Date.now() - activeTabStartTime;
      const durationMinutes = Math.floor(duration / 60000);
      const category = categorizeWebsite(currentTab.url);

      if (durationMinutes > 0) {
        updateDailyStats(category, durationMinutes);
      }
    }

    tabSwitchCount++;
    currentTab = {
      id: tab.id,
      url: tab.url,
      title: tab.title
    };
    activeTabStartTime = Date.now();

    chrome.storage.local.set({ tabSwitchCount, currentTab: currentTab });
  }
});

chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    return;
  }

  chrome.tabs.query({ active: true, windowId: windowId }, (tabs) => {
    if (tabs[0] && currentTab && tabs[0].id !== currentTab.id) {
      if (activeTabStartTime && currentTab.url) {
        const duration = Date.now() - activeTabStartTime;
        const durationMinutes = Math.floor(duration / 60000);
        const category = categorizeWebsite(currentTab.url);

        if (durationMinutes > 0) {
          updateDailyStats(category, durationMinutes);
        }
      }

      tabSwitchCount++;
      currentTab = {
        id: tabs[0].id,
        url: tabs[0].url,
        title: tabs[0].title
      };
      activeTabStartTime = Date.now();

      chrome.storage.local.set({ tabSwitchCount, currentTab: currentTab });
    }
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getStats') {
    chrome.storage.local.get(['tabSwitchCount', 'dailyStats', 'currentTab', 'isTracking'], (result) => {
      sendResponse({
        tabSwitchCount: result.tabSwitchCount || 0,
        dailyStats: result.dailyStats || defaultDailyStats,
        currentTab: result.currentTab || null,
        isTracking: result.isTracking !== false,
        category: result.currentTab ? categorizeWebsite(result.currentTab.url) : 'neutral'
      });
    });
    return true;
  }

  if (request.action === 'resetDaily') {
    chrome.storage.local.set({
      tabSwitchCount: 0,
      dailyStats: { ...defaultDailyStats, date: new Date().toDateString() }
    });
    sendResponse({ success: true });
    return true;
  }

  if (request.action === 'updateTracking') {
    chrome.storage.local.set({ isTracking: request.isTracking });
    sendResponse({ success: true });
    return true;
  }

  if (request.action === 'getCurrentTab') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        const category = categorizeWebsite(tabs[0].url);
        sendResponse({ tab: tabs[0], category });
      } else {
        sendResponse({ tab: null, category: 'neutral' });
      }
    });
    return true;
  }
});

setInterval(() => {
  if (currentTab && activeTabStartTime) {
    const duration = Date.now() - activeTabStartTime;
    const durationMinutes = Math.floor(duration / 60000);

    if (durationMinutes >= 1) {
      const category = categorizeWebsite(currentTab.url);
      updateDailyStats(category, 1);
      activeTabStartTime = Date.now();
    }
  }
}, 60000);
