const user = JSON.parse(localStorage.getItem("creovaUser"));
if (!user) {
  alert("Please log in first.");
  location.replace("login.html");
}
const owner = user ? user.contact : "";

const CATS = [
  ["Bakery", "🧁", "#ffe3e3"], ["Photography", "📷", "#e0efff"], ["Videography", "🎥", "#e6e3ff"],
  ["Hairdressing", "✂️", "#dcf7ea"], ["Makeup", "💄", "#ffe3e8"], ["Pedicure & Manicure", "💅", "#ffecd0"],
  ["Clothes", "👕", "#dcf4f7"], ["Bags", "👜", "#fde3f3"], ["Jewellery", "💎", "#ece3ff"],
  ["Advertising", "📢", "#dfeeff"], ["Writing & Documents", "📝", "#e8e6ff"], ["CVs & Reports", "📄", "#dcf7ea"],
  ["Books", "📖", "#ffe3e3"], ["Graphics & Design", "🎨", "#e0efff"], ["Software & Codes", "💻", "#ebe6ff"],
  ["Other", "⋯", "#e8e8ee"]
];

const grid = document.getElementById("catGrid");
const select = document.getElementById("category");
const otherBox = document.getElementById("otherBox");
const msg = document.getElementById("msg");
const previews = document.getElementById("previews");
const desc = document.getElementById("description");
let images = [];

// category tiles + dropdown stay in sync
CATS.forEach(function (c) {
  const tile = document.createElement("button");
  tile.type = "button";
  tile.className = "tile";
  tile.style.background = c[2];
  const icon = document.createElement("span");
  icon.textContent = c[1];
  tile.appendChild(icon);
  tile.appendChild(document.createTextNode(c[0]));
  tile.addEventListener("click", function () { select.value = c[0]; mark(); });
  grid.appendChild(tile);
  select.add(new Option(c[0], c[0]));
});

function mark() {
  document.querySelectorAll(".tile").forEach(function (t, i) {
    t.classList.toggle("on", CATS[i][0] === select.value);
  });
  otherBox.hidden = select.value !== "Other";
  if (!otherBox.hidden) otherBox.focus();
}
select.addEventListener("change", mark);

desc.addEventListener("input", function () {
  document.getElementById("counter").textContent = desc.value.length + "/1000";
});

function showMsg(text, type) {
  msg.textContent = text;
  msg.className = "msg " + type;
  msg.hidden = false;
}

function showUpgradeMsg(before, after) {
  msg.innerHTML = before + ' <a href="premium.html" style="color:#5b2fd0;font-weight:bold">Upgrade to Premium</a> ' + after;
  msg.className = "msg error";
  msg.hidden = false;
}

// ----- photos -----
function photoLimit() { return isPro(owner) ? Infinity : FREE_PHOTOS; }

function updateCount() {
  document.getElementById("photoCount").textContent = isPro(owner)
    ? images.length + " photos · unlimited (Premium)"
    : images.length + " / " + FREE_PHOTOS + " photos (free plan)";
}

function shrink(file) {
  return new Promise(function (resolve) {
    const reader = new FileReader();
    reader.onload = function () {
      const img = new Image();
      img.onload = function () {
        const scale = Math.min(1, 500 / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.65));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function renderPreviews() {
  previews.innerHTML = "";
  images.forEach(function (src, i) {
    const box = document.createElement("div");
    box.className = "thumb";
    const img = document.createElement("img");
    img.src = src;
    const x = document.createElement("button");
    x.type = "button";
    x.textContent = "×";
    x.addEventListener("click", function () { images.splice(i, 1); renderPreviews(); });
    box.appendChild(img);
    box.appendChild(x);
    previews.appendChild(box);
  });
  updateCount();
}

document.getElementById("fileInput").addEventListener("change", async function () {
  msg.hidden = true;
  let blocked = false;
  for (const file of this.files) {
    if (images.length >= photoLimit()) { blocked = true; break; }
    if (!file.type.startsWith("image/")) {
      showMsg("Videos aren't supported yet. Please upload images (JPG or PNG).", "error");
      continue;
    }
    images.push(await shrink(file));
  }
  this.value = "";
  renderPreviews();
  if (blocked) {
    showUpgradeMsg("Free shops can upload up to " + FREE_PHOTOS + " photos per product.", "to upload unlimited photos.");
  }
});

// ----- create -----
function parseList(text) {
  return text.split(",")
    .map(function (s) { return s.trim().slice(0, 20); })
    .filter(Boolean)
    .filter(function (v, i, a) { return a.indexOf(v) === i; })
    .slice(0, 12);
}

document.getElementById("createForm").addEventListener("submit", function (e) {
  e.preventDefault();
  msg.hidden = true;
  if (!user) return;

  const title = document.getElementById("title").value.trim();
  const description = desc.value.trim();
  const price = Number(document.getElementById("price").value);
  let category = select.value;
  if (category === "Other") category = otherBox.value.trim();

  if (!category) { showMsg("Choose a category (or type one under Other).", "error"); return; }
  if (title.length < 3) { showMsg("Enter a title for your product or service.", "error"); return; }
  if (description.length < 10) { showMsg("Add a short description (at least 10 characters).", "error"); return; }
  if (!price || price < 1) { showMsg("Enter your price in UGX.", "error"); return; }
  if (images.length === 0) { showMsg("Upload at least one photo.", "error"); return; }

  const products = JSON.parse(localStorage.getItem("creovaProducts") || "[]");
  const mine = products.filter(function (p) { return p.owner === owner; });

  if (mine.length >= FREE_LIMIT && !isPro(owner)) {
    showUpgradeMsg("Free shops can list up to " + FREE_LIMIT + " products.", "for unlimited listings.");
    return;
  }

  // item code: P001, P002 ...
  let maxNum = 0;
  mine.forEach(function (p) {
    const n = parseInt(String(p.code || "").slice(1), 10);
    if (n > maxNum) maxNum = n;
  });
  const code = "P" + String(maxNum + 1).padStart(3, "0");

  products.push({
    id: Date.now(),
    owner: owner,
    ownerName: user.name,
    title: title,
    description: description,
    category: category,
    price: price,
    delivery: document.querySelector("input[name=delivery]:checked").value,
    colours: parseList(document.getElementById("colours").value),
    sizes: parseList(document.getElementById("sizes").value),
    images: images,
    code: code,
    created: Date.now()
  });

  try {
    localStorage.setItem("creovaProducts", JSON.stringify(products));
  } catch (err) {
    showMsg("Storage on this phone is full. Remove some photos or delete an old product and try again.", "error");
    return;
  }

  location.href = "shop.html?id=me";
});

renderPreviews();