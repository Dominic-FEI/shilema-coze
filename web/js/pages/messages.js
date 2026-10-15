(function () {
  const auth = window.SHILEMA_AUTH;
  const com = window.SHILEMA_COMMUNITY;
  const ui = window.SHILEMA_UI;
  function renderList() {
    const root = document.getElementById("dm-list");
    const me = auth.currentUser();
    if (!root) return;
    if (!me) {
      root.innerHTML = `<div class="empty" style="margin:var(--space-5)">请先 <a href="profile.html?mode=login&next=messages.html">登录</a> 后查看私信。</div>`;
      return;
    }
    const threads = com.listThreads(me.id);
    if (!threads.length) {
      root.innerHTML = `<div class="empty" style="margin:var(--space-5)">暂无会话。点击右上角「新对话」开始。</div>`;
      return;
    }
    root.innerHTML = threads
      .map((t) => {
        const peerId = com.peerOf(t, me.id);
        const peer = com.userById(peerId);
        return `
          <a class="dm-row" href="chat.html?thread=${encodeURIComponent(t.id)}">
            <img class="avatar avatar--sm" src="${ui.escapeHtml(ui.avatarSrc(peer))}" alt="" width="44" height="44" />
            <div class="dm-row__body">
              <p class="dm-row__name">${ui.escapeHtml(peer?.nickname || "校友")}</p>
              <p class="dm-row__preview">${ui.escapeHtml(t.lastPreview || "")}</p>
            </div>
            <span class="dm-row__time">${ui.formatTime(t.updatedAt)}</span>
          </a>`;
      })
      .join("");
  }

  function showPeers(open) {
    const panel = document.getElementById("dm-start");
    const list = document.getElementById("dm-peers");
    if (!panel || !list) return;
    if (!open) {
      panel.hidden = true;
      return;
    }
    const me = auth.requireLogin("messages.html");
    if (!me) return;
    const peers = com.otherUsers(me.id);
    if (!peers.length) {
      list.innerHTML = `<p class="text-secondary">暂无其他用户</p>`;
    } else {
      list.innerHTML = peers
        .map(
          (u) =>
            `<button type="button" class="btn btn--ghost" data-peer="${ui.escapeHtml(u.id)}" style="justify-content:flex-start">
              ${ui.escapeHtml(u.nickname)} · ${ui.escapeHtml(u.college || "")} · ${ui.escapeHtml(u.studentId)}
            </button>`
        )
        .join("");
      list.querySelectorAll("[data-peer]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const res = com.ensureThread(me.id, btn.getAttribute("data-peer"));
          if (!res.ok) {
            alert(res.msg);
            return;
          }
          location.href = "chat.html?thread=" + encodeURIComponent(res.thread.id);
        });
      });
    }
    panel.hidden = false;
  }

  document.addEventListener("DOMContentLoaded", () => {
    window.SHILEMA_UI?.renderShell("messages");
    document.getElementById("dm-new")?.addEventListener("click", () => showPeers(true));
    document.getElementById("dm-start-close")?.addEventListener("click", () => showPeers(false));
    renderList();
  });
})();
