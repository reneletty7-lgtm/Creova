(function () {
  var user = null;
  try { user = JSON.parse(localStorage.getItem("creovaUser")); } catch (e) {}
  if (!user) return;
  var me = user.contact;

  function chats() {
    try { return JSON.parse(localStorage.getItem("creovaChats")) || []; } catch (e) { return []; }
  }
  function unreadOf(c) {
    return c.seller === me ? (c.unreadSeller || 0) : (c.buyer === me ? (c.unreadBuyer || 0) : 0);
  }
  function total() {
    return chats().reduce(function (s, c) { return s + unreadOf(c); }, 0);
  }

  var KEY = "creovaLastUnread:" + me;
  var last = Number(localStorage.getItem(KEY) || 0);
  var onInbox = /messages\.html$/.test(location.pathname);

  // pop-up banner inside the app
  var css = document.createElement("style");
  css.textContent =
    ".cv-toast{position:fixed;top:10px;left:10px;right:10px;z-index:99999;display:block;background:#3a1a85;color:#fff;padding:12px 14px;border-radius:14px;box-shadow:0 6px 20px rgba(0,0,0,.4);font:14px Arial,sans-serif;text-decoration:none;text-align:left}" +
    ".cv-toast b{display:block;margin-bottom:2px}" +
    ".cv-toast span{opacity:.9}";
  document.head.appendChild(css);

  var toastTimer = null;
  function toast(from, body, url) {
    var old = document.querySelector(".cv-toast");
    if (old) old.remove();
    var a = document.createElement("a");
    a.className = "cv-toast";
    a.href = url;
    var b = document.createElement("b");
    b.textContent = "💬 New message from " + from;
    var s = document.createElement("span");
    s.textContent = body;
    a.appendChild(b);
    a.appendChild(s);
    document.body.appendChild(a);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { a.remove(); }, 7000);
  }

  // phone notification (needs permission)
  function systemNotify(title, body, url) {
    if (!("Notification" in window) || Notification.permission !== "granted") return false;
    var opts = { body: body, icon: "images/icon-192.png", badge: "images/icon-192.png", tag: "creova-msg", data: { url: url } };
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistration().then(function (reg) {
        if (reg) reg.showNotification(title, opts);
        else new Notification(title, opts);
      });
    } else {
      new Notification(title, opts);
    }
    return true;
  }

  function check(firstRun) {
    var n = total();

    // little counter on the Profile page
    var mc = document.getElementById("msgCount");
    if (mc) mc.textContent = n ? n + " new ›" : "›";

    if (n > last) {
      var list = chats()
        .filter(function (c) { return unreadOf(c) > 0; })
        .sort(function (a, b) { return b.updated - a.updated; });
      var c = list[0];
      if (c) {
        var m = c.messages[c.messages.length - 1];
        var from = (c.seller === me ? c.buyerName : c.sellerName) || "a customer";
        var url = "chat.html?c=" + encodeURIComponent(c.id);
        var body = (m ? m.text : "").slice(0, 80);
        var shown = false;
        if (!firstRun && document.hidden) shown = systemNotify("New message from " + from, body, url);
        if (!shown && !onInbox) toast(from, body, url);
      }
    }
    last = n;
    localStorage.setItem(KEY, String(n));
  }

  // "Turn on message alerts" buttons
  var btns = document.querySelectorAll("[data-notify]");
  function refreshButtons() {
    var can = "Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied";
    btns.forEach(function (b) { b.hidden = !can; });
  }
  btns.forEach(function (b) {
    b.addEventListener("click", function (e) {
      e.preventDefault();
      if (!("Notification" in window)) { alert("This browser can't show notifications."); return; }
      Notification.requestPermission().then(function (p) {
        refreshButtons();
        if (p === "granted") alert("Message alerts are on.");
        else alert("Alerts are blocked. You can allow them in your browser's site settings.");
      });
    });
  });
  refreshButtons();

  check(true);
  setInterval(function () { check(false); }, 3000);
  window.addEventListener("storage", function () { check(false); });
})();