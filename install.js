(function () {
  var head = document.head;

  function addLink(rel, href) {
    var l = document.createElement("link");
    l.rel = rel;
    l.href = href;
    head.appendChild(l);
  }
  function addMeta(name, content) {
    var m = document.createElement("meta");
    m.name = name;
    m.content = content;
    head.appendChild(m);
  }

  if (!document.querySelector('link[rel="manifest"]')) addLink("manifest", "manifest.json");
  if (!document.querySelector('meta[name="theme-color"]')) addMeta("theme-color", "#3a1a85");
  addLink("apple-touch-icon", "images/icon-192.png");
  addMeta("apple-mobile-web-app-capable", "yes");
  addMeta("mobile-web-app-capable", "yes");
  addMeta("apple-mobile-web-app-title", "Creova");
// message alerts
  var alertScript = document.createElement("script");
  alertScript.src = "notify.js";
  document.body.appendChild(alertScript);
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }

  var buttons = document.querySelectorAll("[data-install]");
  var standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;

  // already installed: hide everything
  if (standalone) {
    buttons.forEach(function (b) { b.hidden = true; });
    return;
  }

  var style = document.createElement("style");
  style.textContent =
    "[data-install][hidden]{display:none !important}" +
    ".creova-install{position:fixed;left:12px;right:12px;bottom:84px;z-index:9999;display:flex;align-items:center;gap:10px;background:#3a1a85;color:#fff;padding:12px 14px;border-radius:16px;box-shadow:0 6px 20px rgba(0,0,0,.35);font:14px Arial,sans-serif;text-align:left}" +
    ".creova-install .ci-text{flex:1;margin:0}" +
    ".creova-install button{display:inline-block;width:auto;margin:0;cursor:pointer}" +
    ".creova-install .ci-btn{background:#ffc83d;color:#222;border:none;border-radius:20px;padding:9px 16px;font-weight:bold}" +
    ".creova-install .ci-x{background:none;border:none;color:#fff;font-size:22px;padding:0 4px}";
  head.appendChild(style);

  var KEY = "creovaInstallDismissed";
  var deferred = null;
  var bar = null;

  function recentlyDismissed() {
    return Date.now() - Number(localStorage.getItem(KEY) || 0) < 3 * 24 * 60 * 60 * 1000;
  }

  function hideBar() {
    if (bar) bar.remove();
    bar = null;
  }

  function helpText() {
    if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
      return "On iPhone: tap the Share button, then “Add to Home Screen”.";
    }
    return "In Chrome: tap the ⋮ menu, then “Install app” (or “Add to Home screen”).\n\n" +
           "If you don't see it, open this page in Chrome instead of the editor preview.";
  }

  function installNow() {
    if (deferred) {
      deferred.prompt();
      deferred.userChoice.then(function () { deferred = null; hideBar(); });
    } else {
      alert(helpText());
    }
  }

  // the "Install app" buttons on the pages
  buttons.forEach(function (b) {
    b.hidden = false;
    b.addEventListener("click", function (e) {
      e.preventDefault();
      installNow();
    });
  });

  function showBar(text, withButton) {
    if (bar || recentlyDismissed()) return;
    bar = document.createElement("div");
    bar.className = "creova-install";
    bar.innerHTML =
      '<span class="ci-text"></span>' +
      (withButton ? '<button type="button" class="ci-btn">Install</button>' : "") +
      '<button type="button" class="ci-x" aria-label="Close">×</button>';
    bar.querySelector(".ci-text").textContent = text;
    document.body.appendChild(bar);

    bar.querySelector(".ci-x").onclick = function () {
      localStorage.setItem(KEY, String(Date.now()));
      hideBar();
    };
    var btn = bar.querySelector(".ci-btn");
    if (btn) btn.onclick = installNow;
  }

  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferred = e;
    showBar("Install Creova on your phone for quick access.", true);
  });

  window.addEventListener("appinstalled", hideBar);

  if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
    window.addEventListener("load", function () {
      showBar("To install: tap Share, then “Add to Home Screen”.", false);
    });
  }
})();