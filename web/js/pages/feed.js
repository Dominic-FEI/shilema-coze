(function () {
  const auth = window.SHILEMA_AUTH;
  const com = window.SHILEMA_COMMUNITY;
  const mobile = window.SHILEMA_MOBILE;
  const ui = window.SHILEMA_UI;
  let pendingImage = "";

  function render() {
    const root = document.getElementById("feed-list");
    if (!root) return;
    const posts = com.sortedPosts();
    if (!posts.length) {
      root.innerHTML = `<div class="empty">暂无动态。点击右上角「发帖」分享校园互助信息。</div>`;
      return;
    }
    root.innerHTML = posts.map((p) => mobile.renderPostCard(p, { clamp: true, link: true })).join("");
    bindCards(root);
  }

  function bindCards(root) {
    root.querySelectorAll("[data-open-post]").forEach((card) => {
      card.addEventListener("click", (e) => {
        if (e.target.closest("[data-stop]")) return;
        const id = card.getAttribute("data-open-post");
        location.href = "post.html?id=" + encodeURIComponent(id);
      });
    });
    root.querySelectorAll("[data-like]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const me = auth.requireLogin("feed.html");
        if (!me) return;
        const res = com.toggleLike(btn.getAttribute("data-like"), me.id);
        if (!res.ok) alert(res.msg);
        else render();
      });
    });
    root.querySelectorAll("[data-comment]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        location.href = "post.html?id=" + encodeURIComponent(btn.getAttribute("data-comment"));
      });
    });
    root.querySelectorAll("[data-pin]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const me = auth.requireLogin("feed.html");
        if (!me) return;
        const res = com.togglePin(btn.getAttribute("data-pin"), me.id);
        if (!res.ok) alert(res.msg);
        else render();
      });
    });
  }

  function setComposer(open) {
    const panel = document.getElementById("feed-composer");
    if (!panel) return;
    if (open) {
      const me = auth.requireLogin("feed.html");
      if (!me) return;
      panel.hidden = false;
    } else {
      panel.hidden = true;
    }
  }

  function bind() {
    document.getElementById("feed-compose-toggle")?.addEventListener("click", () => {
      const panel = document.getElementById("feed-composer");
      setComposer(!!panel?.hidden);
    });
    document.getElementById("feed-compose-close")?.addEventListener("click", () => setComposer(false));

    const form = document.getElementById("feed-form");
    form?.image?.addEventListener("change", async () => {
      const file = form.image.files?.[0];
      try {
        pendingImage = file ? await ui.readImageFile(file) : "";
      } catch (err) {
        alert(err.message || "图片读取失败");
        form.image.value = "";
        pendingImage = "";
      }
    });

    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const me = auth.requireLogin("feed.html");
      if (!me) return;
      const legal = window.SHILEMA_LEGAL?.assertAccepted(document.getElementById("feed-legal"));
      if (legal && !legal.ok) {
        alert(legal.msg);
        return;
      }
      const res = com.createPost({
        authorId: me.id,
        text: form.text.value,
        image: pendingImage,
      });
      if (!res.ok) {
        alert(res.msg);
        return;
      }
      window.SHILEMA_LEGAL?.recordAcceptance("publish", { action: "feed", userId: me.id });
      form.reset();
      pendingImage = "";
      window.SHILEMA_LEGAL?.reset(document.getElementById("feed-legal"));
      setComposer(false);
      render();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    window.SHILEMA_UI?.renderShell("feed");
    window.SHILEMA_LEGAL?.mountAll();
    bind();
    render();
  });
})();
