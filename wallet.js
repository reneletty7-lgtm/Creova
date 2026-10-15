const MIN = 30000;
const FEE = 0.2;
const PREFIXES = {
  MTN: ["076", "077", "078", "039"],
  Airtel: ["070", "074", "075", "020"]
};

// to test, temporarily uncomment the next line, run once, then delete it:
// localStorage.setItem("creovaWallet", JSON.stringify({ total: 100000, balance: 100000, withdrawn: 0 }));

const wallet = JSON.parse(localStorage.getItem("creovaWallet")) ||
  { total: 0, balance: 0, withdrawn: 0 };

const phone = document.getElementById("phone");
const fullName = document.getElementById("fullName");
const amount = document.getElementById("amount");
const networkTag = document.getElementById("networkTag");
const picker = document.getElementById("picker");
const msg = document.getElementById("msg");
const receiveText = document.getElementById("receiveText");
let network = "";

function money(n) { return "UGX " + n.toLocaleString(); }

function showStats() {
  document.getElementById("totalEarn").textContent = money(wallet.total);
  document.getElementById("balance").textContent = money(wallet.balance);
  document.getElementById("withdrawn").textContent = money(wallet.withdrawn);
}

function showMsg(text, type) {
  msg.textContent = text;
  msg.className = "msg " + type;
  msg.hidden = false;
}

function openPicker() { picker.hidden = false; }
function closePicker() { picker.hidden = true; }

// tapping the number box asks for a network first
phone.addEventListener("focus", function () {
  if (!network) {
    this.blur();
    openPicker();
  }
});

networkTag.addEventListener("click", openPicker);
document.getElementById("cancelPick").addEventListener("click", closePicker);

document.querySelectorAll(".net").forEach(btn => {
  btn.addEventListener("click", function () {
    network = this.dataset.net;
    networkTag.textContent = (network === "MTN" ? "MTN Mobile Money" : "Airtel Money") + "  ✎";
    networkTag.className = "network-tag " + network.toLowerCase();
    networkTag.hidden = false;
    closePicker();
    phone.focus();
  });
});

// numbers only in the phone box
phone.addEventListener("input", function () {
  this.value = this.value.replace(/\D/g, "");
});

// live "you will receive"
amount.addEventListener("input", function () {
  const a = Number(this.value);
  receiveText.textContent = a > 0 ? "You will receive " + money(Math.round(a * (1 - FEE))) : "";
});

document.getElementById("withdrawForm").addEventListener("submit", function (e) {
  e.preventDefault();
  msg.hidden = true;

  if (!network) { openPicker(); return; }

  const number = phone.value.trim();
  if (!/^0\d{9}$/.test(number)) {
    showMsg("Enter a valid 10-digit number, e.g. 0771234567.", "error"); return;
  }
  if (!PREFIXES[network].includes(number.slice(0, 3))) {
    showMsg("This number doesn't look like an " + network + " number. Check it or change the network.", "error"); return;
  }

  const name = fullName.value.trim();
  if (name.length < 3) { showMsg("Enter your full name as registered on mobile money.", "error"); return; }

  const amt = Number(amount.value);
  if (!amt || amt < MIN) { showMsg("Minimum withdrawal is " + money(MIN) + ".", "error"); return; }
  if (amt > wallet.balance) { showMsg("Your available balance is " + money(wallet.balance) + ".", "error"); return; }

  const receive = Math.round(amt * (1 - FEE));
  wallet.balance -= amt;
  wallet.withdrawn += amt;
  localStorage.setItem("creovaWallet", JSON.stringify(wallet));
  addTransaction({ amount: amt, charge: amt - receive, network: network, number: number, name: name });

  showStats();
  showMsg("Request sent! " + money(receive) + " will be sent to " + name + " (" + network + " " + number + ") in 1–3 business days.", "ok");

  this.reset();
  network = "";
  networkTag.hidden = true;
  receiveText.textContent = "";
});

showStats();
// ---------- transaction history ----------
function getTx() {
  return JSON.parse(localStorage.getItem("creovaTx") || "[]");
}

function addTransaction(t) {
  const list = getTx();
  list.unshift({
    id: Date.now(),
    amount: t.amount,
    charge: t.charge,
    network: t.network,
    number: t.number,
    status: "Pending",
    date: new Date().toLocaleString("en-GB", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
    })
  });
  localStorage.setItem("creovaTx", JSON.stringify(list));
  renderTx();
}


// call this when a withdrawal is approved or declined
function setTxStatus(id, status) {
  const list = getTx();
  list.forEach(function (t) { if (t.id === id) t.status = status; });
  localStorage.setItem("creovaTx", JSON.stringify(list));
  renderTx();
}

let txFilter = "All";

function renderTx() {
  const box = document.getElementById("txList");
  let list = getTx();
  if (txFilter !== "All") list = list.filter(function (t) { return t.status === txFilter; });

  if (list.length === 0) {
    box.innerHTML = '<p class="tx-empty">' +
      (txFilter === "All" ? "No transactions yet." : "No " + txFilter.toLowerCase() + " transactions.") + "</p>";
    return;
  }

  box.innerHTML = list.map(function (t) {
    return '<div class="tx">' +
      '<div class="tx-icon">⬆️</div>' +
      '<div class="tx-info"><b>UGX ' + t.amount.toLocaleString() + "</b>" +
      "<small>" + t.network + " • " + t.date + "</small>" +
      "<small>To: " + t.number + "</small>" +
      "<small>Charge: UGX " + t.charge.toLocaleString() + "</small></div>" +
      '<span class="badge ' + t.status.toLowerCase() + '">' + t.status + "</span></div>";
  }).join("");
}

document.querySelectorAll(".tab").forEach(function (tab) {
  tab.addEventListener("click", function () {
    document.querySelectorAll(".tab").forEach(function (x) { x.classList.remove("on"); });
    this.classList.add("on");
    txFilter = this.dataset.f;
    renderTx();
  });
});

renderTx();
function refreshWallet() {
  const w = JSON.parse(localStorage.getItem("creovaWallet")) || { total: 0, balance: 0, withdrawn: 0 };
  wallet.total = w.total;
  wallet.balance = w.balance;
  wallet.withdrawn = w.withdrawn;
  showStats();
  renderTx();
}
window.addEventListener("pageshow", refreshWallet);
window.addEventListener("storage", refreshWallet);
document.addEventListener("visibilitychange", function () {
  if (!document.hidden) refreshWallet();
});