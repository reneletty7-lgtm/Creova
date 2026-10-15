(function () {
  const current = location.pathname.split("/").pop();
  document.querySelectorAll(".bottom-nav a").forEach(function (link) {
    if (link.getAttribute("href") === current) {
      link.classList.add("active");
    }
  });
})();