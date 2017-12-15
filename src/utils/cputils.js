export function saveItem(key, value) {
  if (localStorage) {
    localStorage.setItem(key, value);
  }
}

export function getItem(key) {
  if (localStorage) {
    return localStorage.getItem(key);
  }

  return undefined;
}

export function removeItem(key) {
  if (localStorage) {
    localStorage.removeItem(key);
  }
}

/**
 * 获取当前用户浏览器信息
 * @returns {*}
 */
export function getExplorer() {
  // Opera 8.0+
  const isOpera = (!!window.opr && !!window.opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

  // Firefox 1.0+
  const isFirefox = typeof InstallTrigger !== 'undefined';

  // Safari 3.0+ "[object HTMLElementConstructor]"
  const safariExpression = ((function (p) { return p.toString() === '[object SafariRemoteNotification]'; })(!window.safari || (typeof safari !== 'undefined' && window.safari.pushNotification)));
  const isSafari = /constructor/i.test(window.HTMLElement) || safariExpression;

  // Internet Explorer 6-11
  const isIE = false || !!document.documentMode;

  // Edge 20+
  const isEdge = !isIE && !!window.StyleMedia;

  // Chrome 1+
  const isChrome = !!window.chrome && !!window.chrome.webstore;

  // Blink engine detection
  const isBlink = (isChrome || isOpera) && !!window.CSS;

  // WeiXin
  const isWeiXin = navigator.userAgent.toLocaleLowerCase().indexOf('micromessenger') >= 0;

  if (isOpera) {
    return 'opera';
  }

  if (isFirefox) {
    return 'firefox';
  }

  if (isSafari) {
    return 'safari';
  }

  if (isIE) {
    return 'ie';
  }

  if (isEdge) {
    return 'edge';
  }

  if (isChrome) {
    return 'chrome';
  }

  if (isWeiXin) {
    return 'weixin';
  }

  if (isBlink) {
    return 'blink engine';
  }

  return 'else';
}

export function isNotBlank(str) {
  return str &&
    str !== '' &&
    str !== null &&
    str !== undefined &&
    str.replace(/^\s+/g, '').replace(/\s+$/g, '') !== '';
}
