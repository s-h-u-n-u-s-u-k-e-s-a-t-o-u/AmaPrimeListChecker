(() => {
  const pageUrl = new URL(window.location.href);
  const pathname = `${pageUrl.pathname}${pageUrl.search}`;

  // prime videoの詳細ページか判定
  const isPrimeDetailPage = /(?:amazon\.(?:co\.jp|com)|primevideo\.com)/i.test(pageUrl.hostname)
    && /\/(?:gp\/video\/)?(?:detail|watch)(?:\/|\?|$)|\/detail(?:\/|\?|$)|\/watch(?:\/|\?|$)/i.test(pathname);

  if (!isPrimeDetailPage || /\/ap\/signin|\/gp\/signin|\/login|signin|auth|oauth/i.test(pathname)) {
    return;
  }

  // 視聴状態を判定する関数（戻り値: true=視聴済, false=未見, null=要素がまだ見つからない）
  function checkWatchedState() {
    // 1. 直接 data-is-watched があるかチェック。1件でも未視聴ならfalse
    const allElements = Array.from(document.querySelectorAll('[data-is-watched]'));

    // 2. 配列の要素内で、自身または子孫要素に class="fbl-icon" を持つものを除外する
    const directElements = allElements.filter((el) => {
      // el（data-is-watchedを持つ要素）の内側に .fbl-icon があるかチェック
      const hasIconInside = el.querySelector('.fbl-icon') !== null;
      
      // 内側にアイコンがないもの（false）だけを配列に残す
      return !hasIconInside;
    });
  
    // アイコンを除外した結果、有効な要素が1つも残らなかった場合は、まだ要素が揃っていないとみなしてnullを返す
    if (directElements.length > 0) {
      return !directElements.some((el) => String(el.getAttribute('data-is-watched')).toLowerCase() === 'false');
    }

    // 判定要素自体がまだ見つからない場合は null を返す
    return null;
  }

  let observer = null;
  let timeoutId = null;

  function sendResultAndCleanup(isWatched) {
    if (observer) observer.disconnect();
    if (timeoutId) clearTimeout(timeoutId);

    // 視聴済(true)なら keep: false (タブを閉じる)
    // 未視聴(false)なら keep: true (タブを残す)
    chrome.runtime.sendMessage({
      type: 'video-check-result',
      keep: !isWatched
    });
  }

  function judge() {
    const watchedState = checkWatchedState();
    
    if (watchedState !== null) {
      // 判定（視聴済か未視聴か）が確定したら結果を送信
      sendResultAndCleanup(watchedState);
    }
  }

  // 1. DOMの変更を監視して、要素が登場した瞬間に判定する
  observer = new MutationObserver(() => {
    judge();
  });
  observer.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true
  });

  // 2. ページ読み込み時にすでに要素があるかもしれないので一回実行
  judge();

  // 3. タイムアウト（5秒経っても要素が出ない場合は未視聴としてタブを残す安全策）
  timeoutId = setTimeout(() => {
    sendResultAndCleanup(false); 
  }, 5000);

})();
