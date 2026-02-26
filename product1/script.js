(function () {
  const config = window.PICDROP_PRODUCT_CONFIG;
  if (!config) {
    console.error("Missing PICDROP_PRODUCT_CONFIG in config.js");
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const previewTheme = params.get("theme");
  const activeTheme = previewTheme || config.themeId || "theme-01";

  document.documentElement.setAttribute("data-theme", activeTheme);

  const themeLink = document.createElement("link");
  themeLink.rel = "stylesheet";
  themeLink.href = `../assets/themes/${activeTheme}/theme.css`;
  themeLink.id = "themeStylesheet";
  document.head.appendChild(themeLink);

  const title = document.getElementById("pageTitle");
  const subtitle = document.getElementById("subtitleText");
  const details = document.getElementById("eventDetails");
  const badge = document.getElementById("eventBadge");
  const viewBtn = document.getElementById("viewBtn");
  const uploadBtn = document.getElementById("uploadBtn");

  title.textContent = config.productDisplayName || "Product 1";
  subtitle.textContent = "Tap. Share. View your moments together.";

  const detailRows = [config.coupleName, config.eventName, config.date].filter(Boolean);
  details.innerHTML = detailRows.map((item) => `<div>• ${item}</div>`).join("");

  if (config.eventName) {
    badge.textContent = config.eventName;
  }

  viewBtn.href = config.dropboxViewUrl || "#";
  uploadBtn.href = config.dropboxUploadUrl || "#";

  [viewBtn, uploadBtn].forEach((button) => {
    button.addEventListener("click", () => {
      const eventName = button.getAttribute("data-analytics");
      window.PicDropAnalytics?.emit(eventName, {
        productDisplayName: config.productDisplayName,
        themeId: activeTheme
      });
    });
  });

  if (previewTheme) {
    window.__PICDROP_DEBUG__ = true;
    window.PicDropAnalytics?.emit("theme_preview_active", { previewTheme });
  }
})();
