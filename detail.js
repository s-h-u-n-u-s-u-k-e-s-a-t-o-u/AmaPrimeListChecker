(() => {
  const pageUrl = new URL(window.location.href);
  const pathname = `${pageUrl.pathname}${pageUrl.search}`;
  const isPrimeDetailPage = /(?:amazon\.(?:co\.jp|com)|primevideo\.com)/i.test(pageUrl.hostname)
    && /\/(?:gp\/video\/)?(?:detail|watch)(?:\/|\?|$)|\/detail(?:\/|\?|$)|\/watch(?:\/|\?|$)/i.test(pathname);

  if (!isPrimeDetailPage || /\/ap\/signin|\/gp\/signin|\/login|signin|auth|oauth/i.test(pathname)) {
    return;
  }

  function getWatchedStateFromDom() {
    const direct = document.querySelector('[data-is-watched]');
    if (direct) {
      const value = String(direct.getAttribute('data-is-watched')).toLowerCase();
      if (value === 'true' || value === 'false') {
        return value === 'true';
      }
    }

    const watchedCandidate = document.querySelector('[class*="is-watched"], [class*="watched"], [data-testid*="watched"], [aria-label*="watched"], [aria-label*="Watched"]');
    if (watchedCandidate) {
      const className = watchedCandidate.className || '';
      const value = String(watchedCandidate.getAttribute('data-is-watched') || '').toLowerCase();
      if (value === 'true' || value === 'false') {
        return value === 'true';
      }
      if (className && /(is-watched|watched|completed)/i.test(className)) {
        return true;
      }
    }

    return null;
  }

  function collectText() {
    const bodyText = (document.body ? (document.body.innerText || document.body.textContent || '') : '')
      .replace(/\s+/g, ' ')
      .trim();

    const buttonText = [...document.querySelectorAll('button, a, [role="button"], [data-testid]')]
      .map((element) => (element.textContent || element.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim())
      .filter(Boolean)
      .join(' ');

    return `${document.title || ''} ${bodyText} ${buttonText}`.replace(/\s+/g, ' ').trim();
  }

  function hasEntitlementMarker(text) {
    return /(dアニメストア|アニメタイムズ|entitlement|追加課金|別途課金|有料チャンネル|premium channel|subscription required|channel subscription|premium)/i.test(text)
      || !!document.querySelector('.entitlement-icon, [class*="entitlement"], [data-testid*="entitlement"], [aria-label*="entitlement"], [alt*="entitlement"], [title*="entitlement"]');
  }

  function hasWatchedMarker(text) {
    const watchedPatterns = [
      /視聴済/i,
      /視聴済み/i,
      /視聴履歴/i,
      /再生済/i,
      /再生済み/i,
      /完了/i,
      /終了/i,
      /再開/i,
      /続きから/i,
      /resume watching/i,
      /continue watching/i,
      /watch again/i,
      /rewatch/i,
      /already watched/i,
      /watch history/i,
      /watched/i,
      /completed/i
    ];

    return watchedPatterns.some((pattern) => pattern.test(text));
  }

  function shouldKeep(text, watchedState) {
    if (watchedState !== null) {
      return !watchedState;
    }

    if (hasEntitlementMarker(text)) {
      return true;
    }

    const playPatterns = [
      /再生/i,
      /開始/i,
      /見る/i,
      /watch now/i,
      /play now/i,
      /play episode/i,
      /start watching/i,
      /watch video/i,
      /watch free/i,
      /無料で見る/i,
      /今すぐ見る/i
    ];

    const hasPlayAction = playPatterns.some((pattern) => pattern.test(text));
    const hasWatchAction = /再生|視聴|プレイ|watch|start|見る|continue|resume/i.test(text);

    return !hasWatchedMarker(text) && (!hasWatchAction || hasPlayAction);
  }

  setTimeout(() => {
    const text = collectText();
    const watchedState = getWatchedStateFromDom();
    chrome.runtime.sendMessage({
      type: 'video-check-result',
      keep: shouldKeep(text, watchedState)
    });
  }, 800);
})();
