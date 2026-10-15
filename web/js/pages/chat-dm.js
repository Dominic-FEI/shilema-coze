(function () {
  const auth = window.SHILEMA_AUTH;
  const com = window.SHILEMA_COMMUNITY;
  const ui = window.SHILEMA_UI;
  const emoji = window.SHILEMA_EMOJI;
  const params = new URLSearchParams(location.search);
  const threadId = params.get("thread");

  function renderThread() {
    const me = auth.currentUser();
    const root = document.getElementById("chat-thread");
    const thread = com.getThread(threadId);
    if (!root) return;
    if (!me) {
      location.href = "profile.html?mode=login&next=" + encodeURIComponent("chat.html?thread=" + threadId);
      return;
    }
    if (!thread || !(thread.memberIds || []).includes(me.id)) {
      root.innerHTML = `<div class="empty">会话不存在。<a href="messages.html">返回</a></div>`;
      return;
    }
    const peer = com.userById(com.peerOf(thread, me.id));
    const title = document.getElementById("chat-title");
    if (title) {
      const subText = (peer?.college || "") + (peer?.studentId ? " · " + peer.studentId : "校园互助沟通");
      title.innerHTML = `${ui.escapeHtml(peer?.nickname || "私信")}<span class="m-topbar__sub">${ui.escapeHtml(subText)}</span>`;
    }

    const msgs = com.listMessages(threadId);
    root.innerHTML = msgs
      .map((m) => {
        const mine = m.senderId === me.id;
        const cls = mine ? "chat-bubble chat-bubble--mine" : "chat-bubble chat-bubble--peer";
        let body = "";
        if (m.type === "image" && m.fileData) {
          body = `<img class="chat-bubble__img" src="${ui.escapeHtml(m.fileData)}" alt="图片" />`;
        } else if (m.type === "file" && m.fileData) {
          body = `<a class="chat-bubble__file" href="${ui.escapeHtml(m.fileData)}" download="${ui.escapeHtml(
            m.fileName || "file"
          )}">📎 ${ui.escapeHtml(m.fileName || "文件")}</a>`;
        } else {
          body = ui.escapeHtml(m.text);
        }
        return `<div class="${cls}">${body}<span class="chat-bubble__time">${ui.formatTime(m.createdAt)}</span></div>`;
      })
      .join("");
    root.scrollTop = root.scrollHeight;
  }

  function sendText() {
    const me = auth.currentUser();
    if (!me) return;
    const input = document.getElementById("chat-input");
    const text = input?.value || "";
    const res = com.sendMessage({ threadId, senderId: me.id, type: "text", text });
    if (!res.ok) {
      alert(res.msg);
      return;
    }
    if (input) input.value = "";
    renderThread();
  }

  async function sendFile(file, type) {
    const me = auth.currentUser();
    if (!me || !file) return;
    try {
      let data = "";
      if (type === "image") {
        data = await ui.readImageFile(file, 1.5 * 1024 * 1024);
      } else {
        if (file.size > 2 * 1024 * 1024) throw new Error("文件请小于 2MB（演示限制）");
        data = await ui.readFileAsDataURL(file);
      }
      const res = com.sendMessage({
        threadId,
        senderId: me.id,
        type,
        text: type === "image" ? "[图片]" : file.name,
        fileName: file.name,
        fileData: data,
      });
      if (!res.ok) alert(res.msg);
      else renderThread();
    } catch (err) {
      alert(err.message || "发送失败");
    }
  }

  function bind() {
    const slot = document.getElementById("emoji-slot");
    if (slot) {
      slot.innerHTML = emoji.renderPanelHtml("chat-emoji-panel");
      emoji.bindPanel(document.getElementById("chat-emoji-panel"), (e) => {
        const me = auth.currentUser();
        if (!me) return;
        const res = com.sendMessage({ threadId, senderId: me.id, type: "emoji", text: e });
        if (!res.ok) alert(res.msg);
        else {
          emoji.toggle(document.getElementById("chat-emoji-panel"), false);
          renderThread();
        }
      });
    }

    document.getElementById("chat-emoji")?.addEventListener("click", () => {
      emoji.toggle(document.getElementById("chat-emoji-panel"));
    });
    document.getElementById("chat-send")?.addEventListener("click", sendText);
    document.getElementById("chat-input")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendText();
      }
    });
    document.getElementById("chat-image")?.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      sendFile(file, "image");
      e.target.value = "";
    });
    document.getElementById("chat-file")?.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      sendFile(file, "file");
      e.target.value = "";
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    window.SHILEMA_UI?.renderShell("messages");
    if (!threadId) {
      location.href = "messages.html";
      return;
    }
    const me = auth.requireLogin("chat.html?thread=" + encodeURIComponent(threadId));
    if (!me) return;
    bind();
    renderThread();
  });
})();
