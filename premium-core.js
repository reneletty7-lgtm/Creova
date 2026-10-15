const PRICES = {
  verified: { label: "Verified badge", price: 10000, days: 30 },
  pro:      { label: "Premium shop plan", price: 20000, days: 30 },
  featured: { label: "Featured creator slot", price: 15000, days: 7 },
  boost:    { label: "Boost a product", price: 5000, days: 7 }
};
const FREE_LIMIT = 5;
const COMMISSION = { free: 0.10, pro: 0.05 };
const DAY = 24 * 60 * 60 * 1000;

// "demo" = pretend payment. Change to "live" when a real provider is connected.
const PAYMENT_MODE = "demo";

function readJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (e) { return fallback; }
}

function escHtml(t) {
  return String(t).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function getWalletData() { return readJSON("creovaWallet", { total: 0, balance: 0, withdrawn: 0 }); }
function getPremium(owner) { return readJSON("creovaPremium", {})[owner] || {}; }
function active(until) { return !!until && until > Date.now(); }
function daysLeft(until) { return Math.max(0, Math.ceil((until - Date.now()) / DAY)); }

function isVerified(owner) { return active(getPremium(owner).verifiedUntil); }
function isPro(owner) { return active(getPremium(owner).proUntil); }
function isFeatured(owner) { return active(getPremium(owner).featuredUntil); }
function isBoosted(p) { return !!p && active(p.boostUntil); }

function verifiedMark(owner) {
  return isVerified(owner) ? ' <span class="vbadge" title="Verified">✔</span>' : "";
}

// used later when buyers can order
function commissionFor(owner, amount) {
  return Math.round(amount * (isPro(owner) ? COMMISSION.pro : COMMISSION.free));
}

function extend(owner, field, days) {
  const all = readJSON("creovaPremium", {});
  const cur = all[owner] || {};
  cur[field] = Math.max(Date.now(), cur[field] || 0) + days * DAY;
  all[owner] = cur;
  localStorage.setItem("creovaPremium", JSON.stringify(all));
}

function boostProduct(id, days) {
  const list = readJSON("creovaProducts", []);
  const item = list.find(function (x) { return x.id === id; });
  if (!item) return false;
  item.boostUntil = Math.max(Date.now(), item.boostUntil || 0) + days * DAY;
  localStorage.setItem("creovaProducts", JSON.stringify(list));
  return true;
}

function requestMobileMoneyPayment(info) {
  return new Promise(function (resolve) {
    if (PAYMENT_MODE === "demo") {
      setTimeout(function () { resolve({ ok: true, ref: "DEMO-" + Date.now() }); }, 4000);
      return;
    }
    // LIVE: later, send info (amount, network, number) to your server here.
    resolve({ ok: false, error: "Mobile money payments are not connected yet." });
  });
}

function recordRevenue(owner, kind, amount, method, ref) {
  const rev = readJSON("creovaRevenue", []);
  rev.unshift({
    id: Date.now(), type: kind, amount: amount, owner: owner,
    method: method, ref: ref || "", date: new Date().toLocaleString("en-GB")
  });
  localStorage.setItem("creovaRevenue", JSON.stringify(rev));
}
const FREE_PHOTOS = 10;

// turns a colour name into a swatch colour
function swatchColor(name) {
  const tries = [name, String(name).split(/[\s&\/,-]+/)[0]];
  for (let i = 0; i < tries.length; i++) {
    if (window.CSS && CSS.supports("color", tries[i])) return tries[i];
  }
  return "#cfc3f3";
}

// ---- shareable shop links ----
function getSlugs() { return readJSON("creovaSlugs", {}); }

function getShopSlug(owner, name) {
  const all = getSlugs();
  if (all[owner]) return all[owner];
  const base = String(name || "shop").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 20) || "shop";
  let slug;
  do {
    slug = base + "-" + Math.random().toString(36).slice(2, 6);
  } while (Object.values(all).indexOf(slug) !== -1);
  all[owner] = slug;
  localStorage.setItem("creovaSlugs", JSON.stringify(all));
  return slug;
}

function ownerFromSlug(slug) {
  const all = getSlugs();
  const keys = Object.keys(all);
  for (let i = 0; i < keys.length; i++) {
    if (all[keys[i]] === slug) return keys[i];
  }
  return "";
}

function shopLink(owner, name) {
  return new URL("shop.html?s=" + getShopSlug(owner, name), location.href).href;
}