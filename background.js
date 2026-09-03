const WATCHLIST_URL = 'https://www.amazon.co.jp/gp/video/mystuff/watchlist/tv?ref_=atv_hm_mys_c_4i2srv_1_mys_lnd_wl_tv';
const AMAZON_LOGIN_URL = 'https://www.amazon.co.jp/ap/signin';

function isWatchListUrl(url) {
  if (typeof url !== 'string') {
    return false;
  }

  const normalized = url.toLowerCase();
  return normalized.includes('/gp/video/mystuff/watchlist') || normalized.includes('/mystuff/watchlist') || normalized.includes('/gp/video/mystuff');
}

function isLoginUrl(url) {
  if (typeof url !== 'string') {
    return false;
  }

  const normalized = url.toLowerCase();
  return normalized.includes('/ap/signin') || normalized.includes('/signin') || normalized.includes('/login') || normalized.includes('amazon.co.jp/ap/cvf/reader');
}

function isPrimeVideoUrl(url) {
  if (typeof url !== 'string') {
    return false;
  }

  const normalized = url.toLowerCase();
  return normalized.includes('/gp/video/detail') || normalized.includes('/detail') || normalized.includes('/watch') || normalized.includes('primevideo.com') || normalized.includes('amazon.co.jp/gp/video');
}

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: WATCHLIST_URL, active: true });
});

chrome.runtime.onMessage.addListener((message, sender) => {
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

// とりあえず開きっぱなしにする
  if (message?.type === 'video-check-result' && sender.tab?.id) {
    if (message.keep === false) {
      chrome.tabs.remove(sender.tab.id);
    }
  }

});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete' || !tab.url) {
    return;
  }

  if (isLoginUrl(tab.url)) {
    return;
  }

  if (isWatchListUrl(tab.url)) {
    chrome.scripting.executeScript({
      target: { tabId, allFrames: false },
      files: ['watchlist.js']
    }).catch(() => {});
    return;
  }

  if (isPrimeVideoUrl(tab.url)) {
    chrome.scripting.executeScript({
      target: { tabId, allFrames: false },
      files: ['detail.js']
    }).catch(() => {});
  }
});
