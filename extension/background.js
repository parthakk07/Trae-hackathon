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
let intervalId = null;

const STORAGE_KEY = 'devRealityData';

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
    syncToSharedStorage(stats);
  });
}

function syncToSharedStorage(dailyStats) {
  const sharedData = {
    productiveTime: dailyStats.productive,
    unproductiveTime: dailyStats.unproductive,
    neutralTime: dailyStats.neutral,
    tabSwitches: dailyStats.tabSwitches,
    lastUpdate: Date.now(),
    source: 'extension'
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sharedData));
  } catch (e) {
    console.log('Shared storage sync:', e);
  }
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
    if (result.dailyStats) {
      syncToSharedStorage(result.dailyStats);
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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    if (request.action === 'getData') {
      chrome.storage.local.get(['dailyStats', 'tabSwitchCount', 'currentTab'], (result) => {
        try {
          const data = {
            dailyStats: result.dailyStats || defaultDailyStats,
            tabSwitchCount: result.tabSwitchCount || 0,
            currentTab: result.currentTab || null,
            sharedData: JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
          };
          sendResponse(data);
        } catch (e) {
          sendResponse({ error: e.message });
        }
      });
      return true;
    }

    if (request.action === 'getCurrentTab') {
      const data = {
        tab: currentTab,
        category: currentTab ? categorizeWebsite(currentTab.url) : 'neutral'
      };
      sendResponse(data);
      return true;
    }

    if (request.action === 'startTracking') {
      chrome.storage.local.set({ isTracking: true });
      sendResponse({ success: true });
      return true;
    }

    if (request.action === 'stopTracking') {
      chrome.storage.local.set({ isTracking: false });
      sendResponse({ success: true });
      return true;
    }

    if (request.action === 'resetStats') {
      chrome.storage.local.set({
        dailyStats: { ...defaultDailyStats, date: new Date().toDateString() },
        tabSwitchCount: 0
      });
      syncToSharedStorage({ ...defaultDailyStats, date: new Date().toDateString() });
      sendResponse({ success: true });
      return true;
    }

    if (request.action === 'syncNow') {
      chrome.storage.local.get(['dailyStats'], (result) => {
        if (result.dailyStats) {
          syncToSharedStorage(result.dailyStats);
          sendResponse({ success: true, data: result.dailyStats });
        } else {
          sendResponse({ success: false });
        }
      });
      return true;
    }

    sendResponse({ error: 'Unknown action' });
    return false;
  } catch (error) {
    console.error('Message handler error:', error);
    sendResponse({ error: error.message });
    return false;
  }
});

setInterval(() => {
  chrome.storage.local.get(['dailyStats'], (result) => {
    if (result.dailyStats) {
      syncToSharedStorage(result.dailyStats);
    }
  });
}, 30000);

initializeStorage();
