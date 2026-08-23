(() => {
  const seenUrls = new Set();
  const links = [...document.querySelectorAll('a[href]')]
    .map((link) => {
      const href = link.href || '';
      const text = [
        link.textContent || '',
        link.getAttribute('aria-label') || '',
        link.getAttribute('title') || ''
      ].join(' ');

      return { href, text: text.replace(/\s+/g, ' ').trim() };
    })
    .filter(({ href, text }) => {
      const isPrimeVideoLink = /\/(?:gp\/video\/)?(?:detail|watch)(?:\/|\?|$)|primevideo\.com\/(?:detail|watch)/i.test(href);
      const isExtraCharge = /(dアニメスト|アニメタイムズ|別途課金|追加料金|有料チャンネル|premium|channel|subscription|required)/i.test(text);
      return isPrimeVideoLink && !isExtraCharge;
    })
    .filter(({ href }) => {
      if (seenUrls.has(href)) {
        return false;
      }
      seenUrls.add(href);
      return true;
    })
    .map(({ href }) => href);

  if (links.length > 0) {
    chrome.runtime.sendMessage({ type: 'watchlist-links', links });
  }
})();
