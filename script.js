const languageButton = document.querySelector(".lang-switch");
const translatable = document.querySelectorAll("[data-zh][data-en]");

function getStoredLanguage() {
  try {
    const stored = localStorage.getItem("libcr-language");
    return stored === "zh" || stored === "en" ? stored : null;
  } catch {
    return null;
  }
}

function getBrowserLanguage() {
  const browserLanguages = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];

  return browserLanguages.some((item) => item?.toLowerCase().startsWith("zh"))
    ? "zh"
    : "en";
}

let language = getStoredLanguage() || getBrowserLanguage();

function setLanguage(nextLanguage, remember = false) {
  language = nextLanguage;
  document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  document.title = language === "zh" ? "libcr — Chromium 驱动的原生软件" : "libcr — Chromium-powered native software";
  translatable.forEach((element) => { element.innerHTML = element.dataset[language]; });
  const labels = languageButton.querySelectorAll("span");
  labels[0].classList.toggle("active", language === "zh");
  labels[1].classList.toggle("active", language === "en");
  languageButton.setAttribute("aria-label", language === "zh" ? "Switch to English" : "切换到中文");
  document.querySelector(".skip-link").textContent = language === "zh" ? "跳到主要内容" : "Skip to main content";
  document.querySelector('meta[name="description"]').content = language === "zh"
    ? "libcr 基于 Chromium 与现代 C++ 构建快速、安全、跨平台的原生桌面应用。"
    : "libcr builds fast, secure, cross-platform native desktop applications with Chromium and modern C++.";

  if ("ResizeObserver" in window) layoutProducts();

  if (remember) {
    try {
      localStorage.setItem("libcr-language", language);
    } catch {
      // Language switching still works when browser storage is unavailable.
    }
  }
}

languageButton.addEventListener("click", () => setLanguage(language === "zh" ? "en" : "zh", true));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) { entry.target.classList.add("is-visible"); revealObserver.unobserve(entry.target); }
  });
}, { threshold: 0.08 });
document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));
document.getElementById("year").textContent = new Date().getFullYear();

// Pack cards into the shortest column; retain priority order in the document.
// Without ResizeObserver, the ordinary responsive grid remains usable.
const productGrid = document.querySelector(".product-grid");
const productCards = [...productGrid.querySelectorAll(".product-card")];
const singleColumn = window.matchMedia("(max-width:700px)");
let masonryFrame;

function layoutProducts() {
  if (singleColumn.matches) {
    productGrid.classList.remove("is-masonry");
    productCards.forEach((card) => {
      card.style.removeProperty("grid-column");
      card.style.removeProperty("grid-row");
    });
    return;
  }

  productGrid.classList.add("is-masonry");
  const columnHeights = [0, 0];
  const gap = parseFloat(getComputedStyle(productGrid).columnGap) || 24;
  const heights = productCards.map((card) => card.getBoundingClientRect().height);
  productCards.forEach((card, index) => {
    const column = columnHeights[0] <= columnHeights[1] ? 0 : 1;
    const span = Math.ceil(heights[index]);
    card.style.gridColumn = String(column + 1);
    card.style.gridRow = `${columnHeights[column] + 1} / span ${span}`;
    columnHeights[column] += span + gap;
  });
}

function scheduleProductLayout() {
  cancelAnimationFrame(masonryFrame);
  masonryFrame = requestAnimationFrame(layoutProducts);
}

if ("ResizeObserver" in window) {
  const productResizeObserver = new ResizeObserver(scheduleProductLayout);
  productResizeObserver.observe(productGrid);
  productCards.forEach((card) => productResizeObserver.observe(card));
  singleColumn.addEventListener("change", scheduleProductLayout);
  scheduleProductLayout();
}

setLanguage(language);
