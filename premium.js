const PREFIXES = {
  MTN: ["076", "077", "078", "039"],
  Airtel: ["070", "074", "075", "020"]
};

const user = JSON.parse(localStorage.getItem("creovaUser"));
if (!user) {
  alert("Please log in first.");
  location.replace("login.html");
} else {
  start(user.contact);
}

function start(owner) {
  const box = document.getElementById("cards");
  const msg = document.getElementById("msg");
  const modal = document.getElementById("payModal");
  const payForm = document.getElementById("payForm");
  const payWait = document.getElementById("payWait");
  const payErr = document.getElementById("payErr");
  const payPhone = document.getElementById("payPhone");
  let network = "MTN";
  let pending = null;

  function say(text, type) {
    msg.textContent = text;
    msg.className = "msg " + type;
    msg.hidden = false;
  }

  function showErr(text) {
    payErr.textContent = text;
    payErr.hidden = false;
  }

  function status(until) {
    return active(until) ? "Active · " + daysLeft(until) + " days left" : "Not active";
  }

  // ----- payment screen -----
  function openPay(item) {
    pending = item;
    document.getElementById("payTitle").textContent = item.label;
    document.getElementById("payAmount").textContent =
      "UGX " + item.price.toLocaleString() + " · " + item.days + " days";
    payPhone.value = /^0\d{9}$/.test(owner) ? owner : "";
    payErr.hidden = true;
    payForm.hidden = false;
    payWait.hidden = true;
    modal.hidden = false;
  }

  document.querySelectorAll(".net").forEach(function (b) {
    b.onclick = function () {
      network = b.dataset.net;
      document.querySelectorAll(".net").forEach(function (x) { x.classList.remove("on"); });
      b.classList.add("on");
    };
  });

  payPhone.addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, "");
  });

  document.getElementById("payCancel").onclick = function () { modal.hidden = true; };

  document.getElementById("payGo").onclick = function () {
    const number = payPhone.value.trim();
    if (!/^0\d{9}$/.test(number)) { showErr("Enter a valid 10-digit number, e.g. 0771234567."); return; }
    if (!PREFIXES[network].includes(number.slice(0, 3))) {
      showErr("This doesn't look like an " + network + " number. Check it or switch network.");
      return;
    }
    payErr.hidden = true;
    document.getElementById("waitNum").textContent = number;
    payForm.hidden = true;
    payWait.hidden = false;

    const item = pending;
    requestMobileMoneyPayment({ amount: item.price, network: network, number: number, reason: item.label })
      .then(function (res) {
        modal.hidden = true;
        if (res.ok) {
          recordRevenue(owner, item.kind, item.price, network + " " + number, res.ref);
          item.apply();
          render();
          say(item.label + " activated for " + item.days + " days. Paid with " + network + " Mobile Money.", "ok");
        } else {
          say(res.error || "Payment failed. Please try again.", "error");
        }
      });
  };

  // ----- the cards -----
  function render() {
    const p = getPremium(owner);
    const mine = readJSON("creovaProducts", []).filter(function (x) { return x.owner === owner; });

    document.getElementById("plan").textContent = isPro(owner)
      ? "Premium plan"
      : "Free plan · " + mine.length + "/" + FREE_LIMIT + " listings";

    const defs = [
      ["verified", "✔", "A ✔ badge beside your shop name so buyers trust you.", "verifiedUntil"],
      ["pro", "⭐", "Reply to customer messages, unlimited listings (free: " + FREE_LIMIT + "), unlimited photos per product (free: " + FREE_PHOTOS + ") and only 5% commission instead of 10%.", "proUntil"],
      ["featured", "🌟", "Your shop appears first in the Featured Creators row on the Marketplace.", "featuredUntil"]
    ];

    let html = defs.map(function (d) {
      const pr = PRICES[d[0]];
      return '<div class="pcard"><div class="picon">' + d[1] + '</div>' +
        '<div class="pbody"><h3>' + pr.label + '</h3><p>' + d[2] + '</p><small>' + status(p[d[3]]) + '</small></div>' +
        '<div class="pbuy"><b>UGX ' + pr.price.toLocaleString() + '</b><small>/ ' + pr.days + ' days</small>' +
        '<button class="buy" data-k="' + d[0] + '" data-f="' + d[3] + '">' + (active(p[d[3]]) ? "Extend" : "Buy") + '</button></div></div>';
    }).join("");

    const bp = PRICES.boost;
    if (mine.length === 0) {
      html += '<div class="boost"><div class="boost-top"><div class="picon">🚀</div><div class="pbody"><h3>' + bp.label + '</h3><p>Create a product first, then boost it here.</p></div></div></div>';
    } else {
      html += '<div class="boost"><div class="boost-top"><div class="picon">🚀</div>' +
        '<div class="pbody"><h3>' + bp.label + '</h3><p>Your product shows in the Promoted row on the Marketplace.</p>' +
        '<small>UGX ' + bp.price.toLocaleString() + ' / ' + bp.days + ' days</small></div></div>' +
        '<select id="boostSel">' + mine.map(function (x) {
          return '<option value="' + x.id + '">' + escHtml(x.title) +
            (isBoosted(x) ? " (boosted · " + daysLeft(x.boostUntil) + "d left)" : "") + '</option>';
        }).join("") + '</select>' +
        '<button class="buy wide" id="boostBtn">Boost this product</button></div>';
    }

    box.innerHTML = html;

    box.querySelectorAll(".pcard .buy").forEach(function (b) {
      b.onclick = function () {
        const k = b.dataset.k;
        const f = b.dataset.f;
        const pr = PRICES[k];
        openPay({
          kind: k, label: pr.label, price: pr.price, days: pr.days,
          apply: function () { extend(owner, f, pr.days); }
        });
      };
    });

    const boostBtn = document.getElementById("boostBtn");
    if (boostBtn) {
      boostBtn.onclick = function () {
        const id = Number(document.getElementById("boostSel").value);
        openPay({
          kind: "boost", label: bp.label, price: bp.price, days: bp.days,
          apply: function () { boostProduct(id, bp.days); }
        });
      };
    }
  }

  render();
}