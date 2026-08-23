(() => {
  const pageUrl = new URL(window.location.href);
  const pathname = `${pageUrl.pathname}${pageUrl.search}`;
  const isPrimeDetailPage = /(?:amazon\.(?:co\.jp|com)|primevideo\.com)/i.test(pageUrl.hostname)
    && /\/(?:gp\/video\/)?(?:detail|watch)(?:\/|\?|$)|\/detail(?:\/|\?|$)|\/watch(?:\/|\?|$)/i.test(pathname);

  if (!isPrimeDetailPage || /\/ap\/signin|\/gp\/signin|\/login|signin|auth|oauth/i.test(pathname)) {
    return;
  }

  const bodyText = (document.body ? (document.body.innerText || document.body.textContent || '') : '')
    .replace(/\s+/g, ' ')
    .trim();

  const buttonText = [...document.querySelectorAll('button, a, [role="button"], [data-testid]')]
    .map((element) => (element.textContent || element.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join(' ');

  const pageText = `${document.title || ''} ${bodyText} ${buttonText}`;

  const extraChargePatterns = [
    /dアニメスト/i,
    /アニメタイムズ/i,
    /別途課金/i,
    /追加料金/i,
    /有料チャンネル/i,
    /additional charge/i,
    /premium channel/i,
    /channel subscription/i,
    /subscription required/i
  ];

  if (extraChargePatterns.some((pattern) => pattern.test(pageText))) {
    return;
  }

  const watchPatterns = [
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

  const primaryPlayPatterns = [
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

  const hasWatchedMarker = watchPatterns.some((pattern) => pattern.test(pageText));
  const hasPrimaryPlayAction = primaryPlayPatterns.some((pattern) => pattern.test(pageText));
  const hasAnyVideoAction = /再生|視聴|プレイ|watch|start|見る|continue|resume/i.test(pageText);

  const shouldKeep = !hasWatchedMarker && (!hasAnyVideoAction || hasPrimaryPlayAction || !/視聴済|再生済|continue|resume|watch again|rewatch/i.test(pageText));

  chrome.runtime.sendMessage({
    type: 'video-check-result',
    keep: shouldKeep
  });
})();
