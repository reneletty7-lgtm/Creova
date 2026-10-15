if (typeof isBoosted === "undefined") { window.isBoosted = function () { return false; }; }
if (typeof isFeatured === "undefined") { window.isFeatured = function () { return false; }; }
if (typeof verifiedMark === "undefined") { window.verifiedMark = function () { return ""; }; }
const shops = [
  { id: 1, name: "Glow Studio", icon: "👩🏾", role: "Makeup Artist", bio: "Bridal, event and everyday makeup.",
    items: [{ name: "Bridal Makeup", price: "UGX 150,000" }, { name: "Event Makeup", price: "UGX 80,000" }] },
  { id: 2, name: "Bright Designs", icon: "🖥️", role: "Graphic Designer", bio: "Logos, posters and social media designs.",
    items: [{ name: "Logo Design", price: "UGX 100,000" }, { name: "Poster", price: "UGX 40,000" }] },
  { id: 3, name: "Sweet Bakes", icon: "🍰", role: "Baker", bio: "Fresh cakes and pastries for every occasion.",
    items: [{ name: "Birthday Cake", price: "UGX 90,000" }, { name: "Cupcakes (12)", price: "UGX 30,000" }] },
  { id: 4, name: "Code Craft", icon: "👨🏾‍💻", role: "Web Developer", bio: "Websites and apps for small businesses.",
    items: [{ name: "Business Website", price: "UGX 500,000" }, { name: "Landing Page", price: "UGX 200,000" }] },
  { id: 5, name: "Tasty Treats", icon: "🍲", role: "Cakes & Pastries", bio: "Home-style baking and catering.",
    items: [{ name: "Party Pastries", price: "UGX 60,000" }, { name: "Catering Tray", price: "UGX 120,000" }] },
  { id: 6, name: "Style Hub", icon: "👗", role: "Fashion Designer", bio: "Trendy clothes, shoes and accessories.",
    items: [{ name: "Custom Dress", price: "UGX 120,000" }, { name: "Handbag", price: "UGX 70,000" }] }
];

function esc(t) {
  return String(t).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function getProducts() {
  return JSON.parse(localStorage.getItem("creovaProducts") || "[]");
}

// add a shop for every person who has created products
(function () {
  const seen = {};
  getProducts().forEach(function (p) {
    if (seen[p.owner]) return;
    seen[p.owner] = true;
    shops.push({ id: "u:" + p.owner, owner: p.owner, name: p.ownerName + "'s Shop",
                 icon: "🛍️", role: p.category, user: true });
  });
})();

function getFollowing() {
  return JSON.parse(localStorage.getItem("creovaFollowing") || "[]").map(String);
}

function followButton(id) {
  const on = getFollowing().includes(String(id));
  return '<button class="follow ' + (on ? "on" : "") + '" data-id="' + esc(id) + '">' +
         (on ? "Following" : "Follow") + "</button>";
}

function creatorCard(s) {
  return '<div class="creator">' +
    '<div class="avatar">' + esc(s.icon) + "</div>" +
    "<b>" + esc(s.name) + (s.user ? verifiedMark(s.owner) : "") + "</b><small>" + esc(s.role) + "</small>" +
    (s.user && isFeatured(s.owner) ? '<small class="ftag">🌟 Featured</small>' : "") +
    '<a class="visit" href="shop.html?id=' + encodeURIComponent(s.id) + '">Visit Shop</a>' +
    followButton(s.id) + "</div>";
}

function wireFollowButtons() {
  document.querySelectorAll(".follow").forEach(function (btn) {
    btn.onclick = function () {
      const id = this.dataset.id;
      let list = getFollowing();
      list = list.includes(id) ? list.filter(function (x) { return x !== id; }) : list.concat(id);
      localStorage.setItem("creovaFollowing", JSON.stringify(list));
      const on = list.includes(id);
      this.classList.toggle("on", on);
      this.textContent = on ? "Following" : "Follow";
    };
  });
}