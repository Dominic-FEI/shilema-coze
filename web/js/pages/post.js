(function () {
  const auth = window.SHILEMA_AUTH;
  const com = window.SHILEMA_COMMUNITY;
  const mobile = window.SHILEMA_MOBILE;
  const ui = window.SHILEMA_UI;
  const params = new URLSearchParams(location.search);
  const postId = params.get("id");

  function renderPost() {
    const root = document.getElementById("post-detail");
    const post = com.getPost(postId);
    if (!root) return;
    if (!post) {
      root.innerHTML = `<div class="empty">帖子不存在或已删除。<a href="feed.html">返回社区</a></div>`;
      return null;
    }
    root.innerHTML = mobile.renderPostCard(post, { clamp: false, link: false });
    root.querySelectorAll("[data-like]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const me = auth.requireLogin("post.html?id=" + encodeURIComponent(postId));
        if (!me) return;
        const res = com.toggleLike(postId, me.id);
        if (!res.ok) alert(res.msg);
        else renderAll();
      });
    });
    root.querySelectorAll("[data-pin]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const me = auth.requireLogin("post.html?id=" + encodeURIComponent(postId));
        if (!me) return;
        const res = com.togglePin(postId, me.id);
        if (!res.ok) alert(res.msg);
        else renderAll();
      });
    });
    root.querySelectorAll("[data-comment]").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.getElementById("comment-input")?.focus();
      });
    });
    return post;
  }

  function renderComments() {
    const root = document.getElementById("comment-list");
    if (!root) return;
    const list = com.listComments(postId);
    if (!list.length) {
      root.innerHTML = `<div class="empty">还没有评论，来写第一条友善留言吧。</div>`;
      return;
    }
    root.innerHTML = list
      .map((c) => {
        const u = com.userById(c.authorId);
        return `
          <article class="comment-item">
            <div class="comment-item__head">
              <span class="comment-item__name">${ui.escapeHtml(u?.nickname || "校友")}</span>
              <span class="comment-item__time">${ui.formatTime(c.createdAt)}</span>
            </div>
            <p class="comment-item__text">${ui.escapeHtml(c.text)}</p>
          </article>`;
      })
      .join("");
  }

  function renderAll() {
    renderPost();
    renderComments();
  }

  function bind() {
    document.getElementById("comment-submit")?.addEventListener("click", async () => {
      const me = auth.requireLogin("post.html?id=" + encodeURIComponent(postId || ""));
      if (!me) return;
      if (!postId) {
        alert("帖子无效");
        return;
      }
      const input = document.getElementById("comment-input");
      const text = input?.value || "";
      if (!String(text).trim()) {
        alert("请填写评论");
        return;
      }
      const ok = await window.SHILEMA_LEGAL.openWaitGate("comment", 10);
      if (!ok) return;
      const res = com.addComment({ postId, authorId: me.id, text });
      if (!res.ok) {
        alert(res.msg);
        return;
      }
      if (input) input.value = "";
      renderAll();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    window.SHILEMA_UI?.renderShell("feed");
    if (postId) com.bumpView(postId);
    bind();
    renderAll();
  });
})();
