// change this PIN to your own
const ADMIN_PIN = "1234";

if (sessionStorage.getItem("creovaAdmin") !== "yes") {
  const pin = prompt("Enter admin PIN");
  if (pin === ADMIN_PIN) {
    sessionStorage.setItem("creovaAdmin", "yes");
  } else {
    alert("Wrong PIN.");
    location.replace("home.html");
  }
}

function esc(t) {
  return String(t).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function getTx() { return JSON.parse(localStorage.getItem("creovaTx") || "[]"); }
function saveTx(list) { localStorage.setItem("creovaTx", JSON.stringify(list)); }
function getWallet() {
  return JSON.parse(localStorage.getItem("creovaWallet")) || { total: 0, balance: 0, withdrawn: 0 };
}
function saveWallet(w) { localStorage.setItem("creovaWallet", JSON.stringify(w)); }
function money(n) { return "UGX " + Number(n).toLocaleString(); }

let filter = "All";

function render() {
  const all = getTx();
  const box = document.getElementById("list");

  // counts on the tabs
  document.querySelectorAll(".tab").forEach(function (tab) {
    const f = tab.dataset.f;
    const n = f === "All" ? all.length : all.filter(function (t) { return t.status === f; }).length;
    tab.textContent = f + " (" + n + ")";
  });

  const list = filter === "All" ? all : all.filter(function (t) { return t.status === filter; });

  if (list.length === 0) {
    box.innerHTML = '<p class="empty">No ' + (filter === "All" ? "" : filter.toLowerCase() + " ") + "withdrawals.</p>";"Unlimited listings (free: " + FREE_LIMIT + "), unlimited photos per product (free: " + FREE_PHOTOS + ") and only 5% commission instead of 10%."
    return;
  }

  box.innerHTML = list.map(function (t) {
    const receive = t.amount - t.charge;
    return '<div class="item">' +
      '<div class="item-top"><b>' + money(t.amount) + '</b><span class="badge ' + t.status.toLowerCase() + '">' + t.status + "</span></div>" +
      "<small>" + esc(t.network) + " • " + esc(t.date) + "</small>" +
      "<small>To: " + esc(t.number) + (t.name ? " (" + esc(t.name) + ")" : "") + "</small>" +
      "<small>Charge: " + money(t.charge) + "</small>" +
      '<div class="pay">Send ' + money(receive) + " to " + esc(t.number) + "</div>" +
      (t.status === "Pending"
        ? '<div class="actions">' +
          '<button class="approve" data-id="' + t.id + '">Approve</button>' +
          '<button class="decline" data-id="' + t.id + '">Decline</button></div>'
        : "") +
      "</div>";
  }).join("");

  document.querySelectorAll(".approve").forEach(function (b) {
    b.onclick = function () { decide(Number(b.dataset.id), "Successful"); };
  });
  document.querySelectorAll(".decline").forEach(function (b) {
    b.onclick = function () { decide(Number(b.dataset.id), "Declined"); };
  });
}

function decide(id, status) {
  const list = getTx();
  const t = list.find(function (x) { return x.id === id; });
  if (!t || t.status !== "Pending") return;

  const ask = status === "Successful"
    ? "Approve this withdrawal? Make sure you have sent the money."
    : "Decline this withdrawal? The money returns to the user's balance.";
  if (!confirm(ask)) return;

  t.status = status;
  saveTx(list);

  if (status === "Declined") {
    const w = getWallet();
    w.balance += t.amount;
    w.withdrawn = Math.max(0, w.withdrawn - t.amount);
    saveWallet(w);
  }
  render();
}

document.querySelectorAll(".tab").forEach(function (tab) {
  tab.addEventListener("click", function () {
    document.querySelectorAll(".tab").forEach(function (x) { x.classList.remove("on"); });
    this.classList.add("on");
    filter = this.dataset.f;
    render();
  });
});

document.getElementById("fundBtn").addEventListener("click", function () {
  const a = Number(document.getElementById("fundAmount").value);
  const msg = document.getElementById("fundMsg");
  if (!a || a < 1) { msg.textContent = "Enter an amount."; return; }
  const w = getWallet();
  w.total += a;
  w.balance += a;
  saveWallet(w);
  document.getElementById("fundAmount").value = "";
  msg.textContent = "Added " + money(a) + ". New balance: " + money(w.balance);
});

function renderEarnings() {
  const rev = JSON.parse(localStorage.getItem("creovaRevenue") || "[]");
  const labels = { verified: "Verified badges", pro: "Premium plans", featured: "Featured slots", boost: "Boosts", commission: "sales commission"  };
  const sums = {};
  let total = 0, fees = 0;
  rev.forEach(function (r) { sums[r.type] = (sums[r.type] || 0) + r.amount; total += r.amount; });
  getTx().forEach(function (t) { if (t.status === "Successful") fees += t.charge; });
  total += fees;

  document.getElementById("earn").innerHTML =
    '<div class="item"><div class="item-top"><b>Total: ' + money(total) + "</b></div>" +
    Object.keys(labels).map(function (k) {
      return "<small>" + labels[k] + ": " + money(sums[k] || 0) + "</small>";
    }).join("") +
    "<small>Withdrawal charges (approved): " + money(fees) + "</small></div>";
}

const baseRender = render;
render = function () { baseRender(); renderEarnings(); };
render();