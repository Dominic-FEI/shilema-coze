/**
 * 日间 / 夜间主题 · 遵循 DESIGN_SYSTEM v1.3
 */
(function (global) {
  const KEY = "shilema_theme";

  function getTheme() {
    const saved = localStorage.getItem(KEY);
    if (saved === "light" || saved === "dark") return saved;
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  }

  function applyTheme(theme) {
    const next = theme === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(KEY, next);
    document.querySelectorAll("[data-theme-label]").forEach((el) => {
      el.textContent = next === "dark" ? "日间" : "夜间";
    });
    document.querySelectorAll("[data-theme-toggle]").forEach((el) => {
      el.setAttribute("aria-label", next === "dark" ? "切换到日间模式" : "切换到夜间模式");
    });
  }

  function toggleTheme() {
    applyTheme(getTheme() === "dark" ? "light" : "dark");
  }

  // 尽早应用，减少闪烁
  applyTheme(getTheme());

  global.SHILEMA_THEME = { getTheme, applyTheme, toggleTheme };
})(window);
