const avatar = document.getElementById("avatar");
const photoInput = document.getElementById("photoInput");
const form = document.getElementById("detailsForm");
const phoneInput = document.getElementById("phoneInput");
const locInput = document.getElementById("locInput");
const detailMsg = document.getElementById("detailMsg");
const user = JSON.parse(localStorage.getItem("creovaUser"));

function getAllDetails() {
  try { return JSON.parse(localStorage.getItem("creovaDetails")) || {}; } catch (e) { return {}; }
}

let details = {};

function showInfo() {
  const parts = [];
  if (details.phone) parts.push("📞 " + details.phone);
  if (details.location) parts.push("📍 " + details.location);
  document.getElementById("detailLine").textContent =
    parts.length ? parts.join("  ·  ") : "Add your phone number and location";
}

function showMsg(text, type) {
  detailMsg.textContent = text;
  detailMsg.className = "d-msg " + type;
  detailMsg.hidden = false;
}

// name, contact, letter
if (user) {
  document.getElementById("profileName").textContent = user.name;
  document.getElementById("profileContact").textContent = user.contact;
  avatar.textContent = user.name.charAt(0).toUpperCase();
  details = getAllDetails()[user.contact] || {};
  // registered with a phone number? use it as the default
  if (!details.phone && /^0\d{9}$/.test(user.contact)) details.phone = user.contact;
}
showInfo();

// open / close the form
document.getElementById("editBtn").addEventListener("click", function () {
  form.hidden = !form.hidden;
  detailMsg.hidden = true;
  phoneInput.value = details.phone || "";
  locInput.value = details.location || "";
});

phoneInput.addEventListener("input", function () {
  this.value = this.value.replace(/\D/g, "");
});

// save phone and location
form.addEventListener("submit", function (e) {
  e.preventDefault();
  if (!user) { alert("Please log in first."); return; }

  const phone = phoneInput.value.trim();
  const loc = locInput.value.trim();

  if (!/^0\d{9}$/.test(phone)) {
    showMsg("Enter a valid 10-digit phone number, e.g. 0771234567.", "error");
    return;
  }
  if (loc.length < 2) {
    showMsg("Enter your location, e.g. Kampala, Uganda.", "error");
    return;
  }

  const all = getAllDetails();
  all[user.contact] = { phone: phone, location: loc };
  localStorage.setItem("creovaDetails", JSON.stringify(all));
  details = all[user.contact];

  showInfo();
  showMsg("Saved!", "ok");
  setTimeout(function () { form.hidden = true; }, 800);
});

// show saved photo
const savedPhoto = localStorage.getItem("creovaPhoto");
if (savedPhoto) {
  avatar.style.backgroundImage = "url(" + savedPhoto + ")";
  avatar.textContent = "";
}

// upload a new photo
photoInput.addEventListener("change", function () {
  const file = photoInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function () {
    const img = new Image();
    img.onload = function () {
      const canvas = document.createElement("canvas");
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext("2d");
      const size = Math.min(img.width, img.height);
      ctx.drawImage(img, (img.width - size) / 2, (img.height - size) / 2, size, size, 0, 0, 300, 300);
      const data = canvas.toDataURL("image/jpeg", 0.8);

      localStorage.setItem("creovaPhoto", data);
      avatar.style.backgroundImage = "url(" + data + ")";
      avatar.textContent = "";
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});