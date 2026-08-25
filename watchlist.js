(() => {
  const processedUrls = new Set();
  let timer = null;
  let observer = null;

  function getWatchedState(element) {
    if (!element) {
      return null;
    }

    const direct = element.getAttribute ? element.getAttribute('data-is-watched') : null;
    if (direct !== null) {
      return direct === 'true';
    }

    const classes = element.className || '';
    if (typeof classes === 'string') {
      if (classes.includes('is-watched') || classes.includes('watched')) {
        return !classes.includes('false');
      }
    }

    const closest = element.closest ? element.closest('[data-is-watched]') : null;
    if (closest) {
      return closest.getAttribute('data-is-watched') === 'true';
    }

    return null;
  }

  function collectText(node) {
    if (!node) {
      return '';
    }

    const value = [
      node.textContent || '',
      node.getAttribute('aria-label') || '',
      node.getAttribute('title') || '',
      node.getAttribute('data-testid') || ''
    ].join(' ');

    return value.replace(/\s+/g, ' ').trim();
  }

  function isEntitlementItem(element) {
    if (!element) {
      return false;
    }

    const icon = element.closest('.entitlement-icon, [class*="entitlement"], [data-testid*="entitlement"], [aria-label*="entitlement"], [alt*="entitlement"], [title*="entitlement"]');
    if (icon) {
      return true;
    }

    const text = collectText(element);
    return /(dアニメストア|アニメタイムズ|entitlement|追加課金|別途課金|有料チャンネル|premium|subscription required|premium channel)/i.test(text);
  }

  function normalizeUrl(url) {
    try {
      const instance = new URL(url);
      return instance.href;
    } catch (error) {
      return url;
    }
  }

  function collectLinks() {
    const selectors = [
      'a[href]',
      '[data-testid] a[href]',
      'div a[href]'
    ];

    const items = new Set();

    selectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((link) => {
        const href = normalizeUrl(link.href || '');
        const text = collectText(link);

        if (!href || !/\/gp\/video\/detail(?:\/|\?|$)|\/detail(?:\/|\?|$)|\/watch(?:\/|\?|$)|primevideo\.com\/(?:detail|watch)/i.test(href)) {
          return;
        }

        if (isEntitlementItem(link)) {
          return;
        }

        const watchedState = getWatchedState(link.closest('[data-is-watched], [class*="is-watched"], [class*="watched"]'));
        if (watchedState === true) {
          return;
        }

        if (text && /\b(未視聴|視聴済|watchlist|new|prime|tv)\b/i.test(text) && !/dアニメストア|アニメタイムズ|entitlement/i.test(text)) {
          // keep as candidate; detail.js will make final watched/unwatched decision
        }

        if (!items.has(href)) {
          items.add(href);
        }
      });
    });

    return [...items].filter((href) => !processedUrls.has(href));
  }

  function sendLinks() {
    const links = collectLinks();
    if (links.length > 0) {
      links.forEach((href) => processedUrls.add(href));
      chrome.runtime.sendMessage({ type: 'watchlist-links', links });
    }
  }

  function cleanup() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }

    if (observer) {
      observer.disconnect();
      observer = null;
    }

    window.removeEventListener('load', scheduleScan);
    window.removeEventListener('focus', scheduleScan);
  }

  function scheduleScan() {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      sendLinks();
      cleanup();
    }, 1500);
  }

  observer = new MutationObserver(() => {
    scheduleScan();
  });

  observer.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true
  });

  window.addEventListener('load', scheduleScan, { once: true });
  window.addEventListener('focus', scheduleScan, { once: true });
  scheduleScan();
})();
