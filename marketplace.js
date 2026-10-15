// show the first 5 shops as featured creators
const isF = function (s) { return s.user && isFeatured(s.owner); };
const ordered = shops.filter(isF).concat(shops.filter(function (s) { return !isF(s); }));
document.getElementById("creators").innerHTML = ordered.slice(0, 5).map(creatorCard).join("");
wireFollowButtons();

const boosted = readJSON("creovaProducts", []).filter(isBoosted);
if (boosted.length) {
  document.getElementById("promotedWrap").hidden = false;
  document.getElementById("promoted").innerHTML = boosted.map(function (p) {
    const pic = p.images && p.images[0] ? '<img src="' + p.images[0] + '" alt="">' : "🛍️";
    return '<a class="card" href="shop.html?id=' + encodeURIComponent("u:" + p.owner) + '">' +
      '<div class="thumb" style="background:#f4efff">' + pic + '</div>' +
      '<h3>' + escHtml(p.title) + '</h3>' +
      '<div class="meta">UGX ' + Number(p.price).toLocaleString() + ' <em class="tag product">Promoted</em></div></a>';
  }).join("");
}

// search filters the popular cards
document.getElementById("search").addEventListener("input", function () {
  const text = this.value.toLowerCase();
  document.querySelectorAll(".card").forEach(card => {
    card.style.display = card.textContent.toLowerCase().includes(text) ? "" : "none";
  });
});