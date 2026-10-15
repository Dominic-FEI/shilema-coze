/**
 * 校园社区 · 帖子 / 评论 / 点赞 / 私信（本地演示）
 */
(function (global) {
  const store = () => global.SHILEMA_STORE;

  function state() {
    return store().getState();
  }

  function save(s) {
    store().setState(s);
  }

  function userById(id) {
    return state().users.find((u) => u.id === id) || null;
  }

  function commentCount(postId) {
    return (state().communityComments || []).filter((c) => c.postId === postId).length;
  }

  function sortedPosts() {
    return (state().communityPosts || [])
      .slice()
      .sort((a, b) => {
        const ap = a.pinned ? 1 : 0;
        const bp = b.pinned ? 1 : 0;
        if (ap !== bp) return bp - ap;
        if (a.pinned && b.pinned) return (b.pinnedAt || 0) - (a.pinnedAt || 0);
        return b.createdAt - a.createdAt;
      });
  }

  function getPost(id) {
    return (state().communityPosts || []).find((p) => p.id === id) || null;
  }

  function createPost({ authorId, text, image }) {
    const body = String(text || "").trim();
    if (!body) return { ok: false, msg: "请填写帖子内容" };
    if (body.length > 2000) return { ok: false, msg: "内容请控制在 2000 字内" };
    const s = state();
    const post = {
      id: store().uid("cpost"),
      authorId,
      text: body,
      image: image || "",
      views: 0,
      likeIds: [],
      pinned: false,
      pinnedAt: 0,
      createdAt: Date.now(),
    };
    s.communityPosts = s.communityPosts || [];
    s.communityPosts.unshift(post);
    save(s);
    return { ok: true, post };
  }

  function togglePin(postId, userId) {
    const s = state();
    const post = (s.communityPosts || []).find((p) => p.id === postId);
    if (!post) return { ok: false, msg: "帖子不存在" };
    if (post.authorId !== userId) return { ok: false, msg: "仅作者可置顶/取消置顶" };
    post.pinned = !post.pinned;
    post.pinnedAt = post.pinned ? Date.now() : 0;
    save(s);
    return { ok: true, post };
  }

  function toggleLike(postId, userId) {
    const s = state();
    const post = (s.communityPosts || []).find((p) => p.id === postId);
    if (!post) return { ok: false, msg: "帖子不存在" };
    post.likeIds = post.likeIds || [];
    const i = post.likeIds.indexOf(userId);
    if (i >= 0) post.likeIds.splice(i, 1);
    else post.likeIds.push(userId);
    save(s);
    return { ok: true, liked: i < 0, count: post.likeIds.length };
  }

  function bumpView(postId) {
    const s = state();
    const post = (s.communityPosts || []).find((p) => p.id === postId);
    if (!post) return;
    post.views = (post.views || 0) + 1;
    save(s);
  }

  function listComments(postId) {
    return (state().communityComments || [])
      .filter((c) => c.postId === postId)
      .sort((a, b) => a.createdAt - b.createdAt);
  }

  function addComment({ postId, authorId, text }) {
    const body = String(text || "").trim();
    if (!body) return { ok: false, msg: "请填写评论" };
    if (body.length > 500) return { ok: false, msg: "评论请控制在 500 字内" };
    if (!getPost(postId)) return { ok: false, msg: "帖子不存在" };
    const s = state();
    const comment = {
      id: store().uid("cmt"),
      postId,
      authorId,
      text: body,
      createdAt: Date.now(),
      acceptedDisclaimerAt: Date.now(),
    };
    s.communityComments = s.communityComments || [];
    s.communityComments.push(comment);
    save(s);
    return { ok: true, comment };
  }

  function threadKey(a, b) {
    return [a, b].sort().join("__");
  }

  function listThreads(userId) {
    return (state().dmThreads || [])
      .filter((t) => (t.memberIds || []).includes(userId))
      .slice()
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  function getThread(id) {
    return (state().dmThreads || []).find((t) => t.id === id) || null;
  }

  function peerOf(thread, userId) {
    return (thread.memberIds || []).find((id) => id !== userId) || null;
  }

  function ensureThread(userId, peerId) {
    if (!peerId || peerId === userId) return { ok: false, msg: "无法与自己私信" };
    if (!userById(peerId)) return { ok: false, msg: "对方不存在" };
    const s = state();
    s.dmThreads = s.dmThreads || [];
    let thread = s.dmThreads.find(
      (t) => threadKey(t.memberIds[0], t.memberIds[1]) === threadKey(userId, peerId)
    );
    if (!thread) {
      thread = {
        id: store().uid("dm"),
        memberIds: [userId, peerId],
        updatedAt: Date.now(),
        lastPreview: "开始对话",
      };
      s.dmThreads.unshift(thread);
      save(s);
    }
    return { ok: true, thread };
  }

  function listMessages(threadId) {
    return (state().dmMessages || [])
      .filter((m) => m.threadId === threadId)
      .sort((a, b) => a.createdAt - b.createdAt);
  }

  function sendMessage({ threadId, senderId, type, text, fileName, fileData }) {
    const s = state();
    const thread = (s.dmThreads || []).find((t) => t.id === threadId);
    if (!thread) return { ok: false, msg: "会话不存在" };
    if (!(thread.memberIds || []).includes(senderId)) return { ok: false, msg: "无权发送" };
    const msgType = type || "text";
    let preview = "";
    const msg = {
      id: store().uid("msg"),
      threadId,
      senderId,
      type: msgType,
      text: String(text || ""),
      fileName: fileName || "",
      fileData: fileData || "",
      createdAt: Date.now(),
    };
    if (msgType === "text" || msgType === "emoji") {
      if (!msg.text.trim()) return { ok: false, msg: "请输入内容" };
      preview = msg.text.slice(0, 40);
    } else if (msgType === "image") {
      if (!msg.fileData) return { ok: false, msg: "请选择图片" };
      preview = "[图片]";
    } else if (msgType === "file") {
      if (!msg.fileData) return { ok: false, msg: "请选择文件" };
      preview = "[文件] " + (msg.fileName || "附件");
    } else {
      return { ok: false, msg: "不支持的消息类型" };
    }
    s.dmMessages = s.dmMessages || [];
    s.dmMessages.push(msg);
    thread.updatedAt = Date.now();
    thread.lastPreview = preview;
    save(s);
    return { ok: true, message: msg };
  }

  function otherUsers(exceptId) {
    return (state().users || []).filter((u) => u.id !== exceptId);
  }

  global.SHILEMA_COMMUNITY = {
    userById,
    commentCount,
    sortedPosts,
    getPost,
    createPost,
    togglePin,
    toggleLike,
    bumpView,
    listComments,
    addComment,
    listThreads,
    getThread,
    peerOf,
    ensureThread,
    listMessages,
    sendMessage,
    otherUsers,
  };
})(window);
