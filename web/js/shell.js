/**
 * 共用顶栏 / 页脚 / XISU 元素 / 账号菜单
 */
(function (global) {
  const NAV = [
    { href: "index.html", key: "home", label: "首页" },
    { href: "feed.html", key: "feed", label: "社区" },
    { href: "lost.html", key: "lost", label: "失物招领" },
    { href: "trade.html", key: "trade", label: "闲置交易" },
    { href: "messages.html", key: "messages", label: "私信" },
  ];

  function escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function avatarSrc(user) {
    if (user?.avatar) return user.avatar;
    const ch = (user?.nickname || "?").slice(0, 1);
    return (
      "data:image/svg+xml," +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72"><rect fill="#E8EEF6" width="72" height="72"/><text x="36" y="42" text-anchor="middle" fill="#1A3668" font-size="24" font-family="sans-serif">${ch}</text></svg>`
      )
    );
  }

  function bindHeaderActions(activeKey) {
    document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
      btn.onclick = () => global.SHILEMA_THEME?.toggleTheme();
    });

    document.querySelectorAll('[data-action="open-chat"]').forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        if (typeof global.SHILEMA_CHAT?.open === "function") global.SHILEMA_CHAT.open();
        else alert("助手未就绪：请确认 Chat SDK 已加载，且智能体已发布 Chat SDK。");
      });
    });

    const menu = document.querySelector(".account-menu");
    if (!menu) return;
    const btn = menu.querySelector(".account-menu__btn");
    const panel = menu.querySelector(".account-menu__panel");
    btn?.addEventListener("click", (e) => {
      e.stopPropagation();
      if (panel) panel.hidden = !panel.hidden;
    });
    document.addEventListener("click", () => {
      if (panel) panel.hidden = true;
    });
    panel?.addEventListener("click", (e) => e.stopPropagation());

    menu.querySelector("[data-action='switch-account']")?.addEventListener("click", () => {
      global.SHILEMA_AUTH?.logout();
      location.href = "profile.html?mode=login&next=" + encodeURIComponent(location.pathname.split("/").pop() || "index.html");
    });
    menu.querySelector("[data-action='logout']")?.addEventListener("click", () => {
      global.SHILEMA_AUTH?.logout();
      location.href = "profile.html?mode=login";
    });
  }

  function renderShell(activeKey) {
    const user = global.SHILEMA_AUTH?.currentUser();
    const header = document.getElementById("app-header");
    const footer = document.getElementById("app-footer");
    const themeLabel = global.SHILEMA_THEME?.getTheme() === "dark" ? "日间" : "夜间";

    if (header) {
      const nav = NAV.map(
        (item) =>
          `<li><a href="${item.href}" class="${item.key === activeKey ? "is-active" : ""}">${item.label}</a></li>`
      ).join("");

      const account = user
        ? `<div class="account-menu">
            <button type="button" class="account-menu__btn" aria-haspopup="true">
              <img class="avatar avatar--sm" src="${escapeHtml(avatarSrc(user))}" alt="头像" width="36" height="36" />
              <span>${escapeHtml(user.nickname)}</span>
            </button>
            <div class="account-menu__panel" hidden>
              <a href="profile.html">个人主页</a>
              <button type="button" data-action="switch-account">切换账号</button>
              <button type="button" data-action="logout">注销</button>
            </div>
          </div>`
        : `<a class="btn btn--ghost" href="profile.html?mode=login" style="min-height:36px;padding:0 12px">登录</a>`;

      header.classList.add("app-chrome");
      header.innerHTML = `
        <div class="campus-masthead" role="banner">
          <div class="campus-masthead__inner">
            <img class="campus-masthead__crest" src="./assets/xisu-crest.png" alt="西安外国语大学校徽" />
            <div class="campus-masthead__text">
              <p class="campus-masthead__cn">西安外国语大学</p>
              <p class="campus-masthead__en">Xi'an International Studies University · XISU · 1952</p>
            </div>
          </div>
        </div>
        <div class="site-header">
          <div class="site-header__inner">
            <a class="site-header__brand-wrap" href="index.html">
              <img class="xisu-crest" src="./assets/xisu-crest.png" alt="" />
              <span>
                <span class="site-header__brand">拾了么</span>
                <span class="site-header__sub">Campus Lost &amp; Trade</span>
              </span>
            </a>
            <nav aria-label="主导航">
              <ul class="site-header__nav">
                ${nav}
                <li><a href="#" data-action="open-chat">AI 助手</a></li>
              </ul>
            </nav>
            <div class="site-header__actions">
              <button type="button" class="theme-toggle" data-theme-toggle data-theme-label aria-label="切换主题">${themeLabel}</button>
              ${account}
            </div>
          </div>
        </div>`;
    }

    if (footer) {
      const ver = global.SHILEMA_VERSION?.label || "v1.6.1";
      footer.innerHTML = `<p>拾了么 · 服务西外师生 · 失物招领与闲置互换 · <span class="site-footer__ver">${escapeHtml(ver)}</span></p>`;
    }

    bindHeaderActions(activeKey);
    global.SHILEMA_THEME?.applyTheme(global.SHILEMA_THEME.getTheme());
  }

  function initReveal() {
    const nodes = document.querySelectorAll(".reveal");
    if (!nodes.length) return;
    if (!("IntersectionObserver" in window)) {
      nodes.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    nodes.forEach((el) => io.observe(el));
  }

  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function readImageFile(file, maxBytes) {
    const limit = maxBytes || 1.2 * 1024 * 1024;
    if (!file) return "";
    if (!file.type.startsWith("image/")) throw new Error("请上传图片文件");
    if (file.size > limit) throw new Error("图片请小于 " + Math.round(limit / 1024) + "KB");
    return readFileAsDataURL(file);
  }

  function formatTime(ts) {
    const d = new Date(ts);
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const h = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${m}/${day} ${h}:${min}`;
  }

  global.SHILEMA_UI = {
    renderShell,
    initReveal,
    escapeHtml,
    readFileAsDataURL,
    readImageFile,
    formatTime,
    avatarSrc,
  };
})(window);
