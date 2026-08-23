const WATCHLIST_URL = 'https://www.amazon.co.jp/gp/video/mystuff';
const WATCHLIST_URL_VARIANTS = [
  'https://www.amazon.co.jp/gp/video/mystuff',
  'https://www.amazon.co.jp/gp/video/mystuff/ref=atv_nb_mystuff',
  'https://www.primevideo.com/gp/video/mystuff',
  'https://www.primevideo.com/mystuff'
];

function isWatchListUrl(url) {
  if (typeof url !== 'string') {
    return false;
  }

  const normalizedUrl = url.replace(/\?.*$/, '').replace(/\/?$/, '');
  return WATCHLIST_URL_VARIANTS.some((candidate) => {
    const normalizedCandidate = candidate.replace(/\?.*$/, '').replace(/\/?$/, '');
    return normalizedUrl === normalizedCandidate || normalizedUrl.startsWith(normalizedCandidate + '/');
  }) || /\/gp\/video\/mystuff|\/mystuff/i.test(url);
}

function isPrimeVideoDetailUrl(url) {
  if (typeof url !== 'string') {
    return false;
  }

  return /\/gp\/video\/(?:detail|watch)|\/detail(?:\/|\?|$)|\/watch(?:\/|\?|$)|primevideo\.com\/detail/i.test(url);
}

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: WATCHLIST_URL, active: true });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'start-check') {
    chrome.tabs.create({ url: WATCHLIST_URL, active: true });
    return;
  }

  if (message?.type === 'watchlist-links') {
    const links = Array.from(new Set(message.links || []));
    for (const link of links) {
      chrome.tabs.create({ url: link, active: false });
    }
    return;
  }

  if (message?.type === 'video-check-result' && sender.tab?.id) {
    if (message.keep === false) {
      chrome.tabs.remove(sender.tab.id);
    }
    return;
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete' || !tab.url) {
    return;
  }

  if (isWatchListUrl(tab.url)) {
    chrome.scripting.executeScript({
      target: { tabId, allFrames: false },
      files: ['watchlist.js']
    }).catch(() => {});
    return;
  }

  if (isPrimeVideoDetailUrl(tab.url)) {
    chrome.scripting.executeScript({
      target: { tabId, allFrames: false },
      files: ['detail.js']
    }).catch(() => {});
  }
});
