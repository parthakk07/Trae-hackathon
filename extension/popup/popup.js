(function() {
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

  function formatTime(minutes) {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function updateUI(data) {
    const stats = data.dailyStats || {};
    const productiveEl = document.getElementById('productive-time');
    const unproductiveEl = document.getElementById('unproductive-time');
    const neutralEl = document.getElementById('neutral-time');
    const tabSwitchesEl = document.getElementById('tab-switches');

    if (productiveEl) productiveEl.textContent = formatTime(stats.productive || 0);
    if (unproductiveEl) unproductiveEl.textContent = formatTime(stats.unproductive || 0);
    if (neutralEl) neutralEl.textContent = formatTime(stats.neutral || 0);
    if (tabSwitchesEl) tabSwitchesEl.textContent = stats.tabSwitches || 0;
  }

  function updateCurrentSite(tab, category) {
    const titleEl = document.getElementById('site-title');
    const urlEl = document.getElementById('site-url');
    const categoryEl = document.getElementById('site-category');

    if (tab && titleEl && urlEl && categoryEl) {
      titleEl.textContent = tab.title || 'Unknown';
      urlEl.textContent = tab.url || '-';
      categoryEl.textContent = category || 'neutral';
    }
  }

  let siteStartTime = Date.now();

  function updateTimer() {
    const timerEl = document.getElementById('timer');
    if (timerEl) {
      const elapsed = Math.floor((Date.now() - siteStartTime) / 1000);
      timerEl.textContent = `Time on site: ${formatDuration(elapsed)}`;
    }
  }

  setInterval(updateTimer, 1000);

  function loadStats() {
    chrome.runtime.sendMessage({ action: 'getStats' }, (response) => {
      if (response) {
        updateUI(response);
        if (response.currentTab) {
          updateCurrentSite(response.currentTab, response.category);
        }
      }
    });

    chrome.runtime.sendMessage({ action: 'getCurrentTab' }, (response) => {
      if (response && response.tab) {
        updateCurrentSite(response.tab, response.category);
        siteStartTime = Date.now();
      }
    });
  }

  loadStats();

  setInterval(loadStats, 5000);

  document.getElementById('open-dashboard')?.addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:3000' });
  });

  document.getElementById('reset-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    if (confirm('Reset all today\'s stats?')) {
      chrome.runtime.sendMessage({ action: 'resetDaily' }, (response) => {
        if (response?.success) {
          updateUI({
            dailyStats: {
              productive: 0,
              neutral: 0,
              unproductive: 0,
              tabSwitches: 0
            }
          });
          siteStartTime = Date.now();
        }
      });
    }
  });

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.dailyStats || changes.tabSwitchCount) {
      loadStats();
    }
  });
})();
