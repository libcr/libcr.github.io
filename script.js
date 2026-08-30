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
setLanguage(language);
