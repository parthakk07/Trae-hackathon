(function() {
  const PRODUCTIVE_PATTERNS = [
    'github', 'gitlab', 'bitbucket', 'stackoverflow', 'stackblitz', 'codesandbox',
    'docs.', 'developer.', 'api.', 'medium.com', 'dev.to', 'notion', 'figma',
    'vercel', 'netlify', 'aws.amazon', 'reactjs', 'vuejs', 'angular',
    'typescript', 'python.org', 'rust-lang', 'go.dev', 'npmjs', 'yarnpkg',
    'leetcode', 'hackerrank', 'docker', 'kubernetes'
  ];

  const UNPRODUCTIVE_PATTERNS = [
    'youtube', 'youtu.be', 'twitter', 'x.com', 'facebook', 'instagram',
    'tiktok', 'reddit', '9gag', 'netflix', 'hulu', 'twitch', 'discord',
    'spotify', 'soundcloud', 'mail.google', 'gmail', 'news.', 'cnn', 'bbc'
  ];

  let pageLoadTime = Date.now();
  let isHidden = false;
  let lastReportedUrl = null;

  function getWebsiteCategory() {
    const url = window.location.href.toLowerCase();
    const hostname = window.location.hostname.toLowerCase();

    if (hostname.startsWith('chrome://') || hostname.startsWith('about:')) {
      return 'neutral';
    }

    for (const pattern of PRODUCTIVE_PATTERNS) {
      if (hostname.includes(pattern) || url.includes(pattern)) {
        return 'productive';
      }
    }

    for (const pattern of UNPRODUCTIVE_PATTERNS) {
      if (hostname.includes(pattern) || url.includes(pattern)) {
        return 'unproductive';
      }
    }

    return 'neutral';
  }

  function sendPageData() {
    const data = {
      url: window.location.href,
      title: document.title,
      category: getWebsiteCategory(),
      timeSpent: Math.floor((Date.now() - pageLoadTime) / 1000),
      timestamp: Date.now()
    };

    if (data.url !== lastReportedUrl || data.timeSpent >= 30) {
      chrome.runtime.sendMessage({
        action: 'pageData',
        data: data
      }, (response) => {
        if (response && response.success) {
          lastReportedUrl = data.url;
        }
      });
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      isHidden = true;
      sendPageData();
    } else {
      isHidden = false;
      pageLoadTime = Date.now();
    }
  });

  window.addEventListener('beforeunload', () => {
    sendPageData();
  });

  setInterval(() => {
    if (!isHidden && document.hasFocus()) {
      sendPageData();
    }
  }, 30000);

  chrome.runtime.sendMessage({
    action: 'contentLoaded',
    data: {
      url: window.location.href,
      title: document.title,
      category: getWebsiteCategory()
    }
  });
})();
