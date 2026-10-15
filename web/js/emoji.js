/**
 * 免费表情面板（Unicode + Twemoji 可选渲染）
 * Twemoji：Twitter 开源表情，CC-BY 4.0，jsDelivr CDN
 * 裸 Unicode 亦可本地显示，不依赖外网
 */
(function (global) {
  const TWEMOJI_BASE = "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/";

  /** 校园向、安全向精选（无侵权字体依赖） */
  const PACK = [
    "😀", "🙂", "😊", "🥰", "😌", "🤔", "😅", "🙌",
    "👍", "👎", "👏", "🤝", "💪", "✨", "🌟", "🔥",
    "📚", "📝", "🎓", "🏫", "📍", "🎒", "☕", "🍙",
    "🌂", "🔑", "📱", "💻", "🎧", "📷", "📎", "📌",
    "❤️", "🧡", "💛", "💚", "💙", "✅", "❗", "🙏",
  ];

  function toCodePoint(emoji) {
    const cps = [];
    for (const ch of emoji) {
      const cp = ch.codePointAt(0);
      if (cp === 0xfe0f) continue;
      cps.push(cp.toString(16));
    }
    return cps.join("-");
  }

  function twemojiUrl(emoji) {
    return TWEMOJI_BASE + toCodePoint(emoji) + ".png";
  }

  function renderPanelHtml(panelId) {
    return `
      <div class="emoji-panel" id="${panelId}" hidden>
        <p class="emoji-panel__hint">免费表情 · Unicode / Twemoji（CC-BY 4.0）</p>
        <div class="emoji-panel__grid" role="listbox" aria-label="表情">
          ${PACK.map(
            (e) =>
              `<button type="button" class="emoji-panel__btn" data-emoji="${e}" title="${e}">
                <img src="${twemojiUrl(e)}" alt="${e}" width="28" height="28" loading="lazy"
                  onerror="this.replaceWith(document.createTextNode('${e}'))" />
              </button>`
          ).join("")}
        </div>
      </div>`;
  }

  function bindPanel(panelEl, onPick) {
    if (!panelEl) return;
    panelEl.querySelectorAll("[data-emoji]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const emoji = btn.getAttribute("data-emoji");
        if (emoji && typeof onPick === "function") onPick(emoji);
      });
    });
  }

  function toggle(panelEl, force) {
    if (!panelEl) return;
    const next = force != null ? force : panelEl.hidden;
    panelEl.hidden = !next;
  }

  global.SHILEMA_EMOJI = {
    PACK,
    twemojiUrl,
    renderPanelHtml,
    bindPanel,
    toggle,
  };
})(window);
