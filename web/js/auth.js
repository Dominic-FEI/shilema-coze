/**
 * 学号账号：注册 / 登录 / 资料更新
 */
(function (global) {
  const store = () => global.SHILEMA_STORE;

  function users() {
    return store().getState().users;
  }

  function currentUser() {
    const state = store().getState();
    if (!state.sessionUserId) return null;
    return state.users.find((u) => u.id === state.sessionUserId) || null;
  }

  function requireLogin(redirectTo) {
    const user = currentUser();
    if (user) return user;
    const next = encodeURIComponent(redirectTo || location.pathname.split("/").pop() || "index.html");
    location.href = "profile.html?mode=login&next=" + next;
    return null;
  }

  function register(payload) {
    const state = store().getState();
    const studentId = String(payload.studentId || "").trim();
    if (!/^\d{6,20}$/.test(studentId)) {
      return { ok: false, msg: "学号需为 6～20 位数字" };
    }
    if (state.users.some((u) => u.studentId === studentId)) {
      return { ok: false, msg: "该学号已注册" };
    }
    const password = String(payload.password || "");
    if (password.length < 6) return { ok: false, msg: "密码至少 6 位" };
    const realName = String(payload.realName || "").trim();
    if (!realName) return { ok: false, msg: "请填写真实姓名" };
    const college = String(payload.college || "").trim();
    if (!college) return { ok: false, msg: "请填写学院" };

    const user = {
      id: store().uid("user"),
      studentId,
      password,
      realName,
      nickname: String(payload.nickname || realName).trim() || realName,
      gender: payload.gender || "保密",
      college,
      phone: String(payload.phone || "").trim(),
      avatar: payload.avatar || "",
      acceptedAccountTosAt: payload.acceptedAccountTosAt || Date.now(),
      acceptedAccountTosVersion: payload.acceptedAccountTosVersion || "",
      createdAt: Date.now(),
    };
    state.users.push(user);
    state.sessionUserId = user.id;
    store().setState(state);
    return { ok: true, user };
  }

  function login(studentId, password) {
    const state = store().getState();
    const user = state.users.find(
      (u) => u.studentId === String(studentId).trim() && u.password === String(password)
    );
    if (!user) return { ok: false, msg: "学号或密码不正确" };
    state.sessionUserId = user.id;
    store().setState(state);
    return { ok: true, user };
  }

  function logout() {
    const state = store().getState();
    state.sessionUserId = null;
    store().setState(state);
  }

  function updateProfile(patch) {
    const state = store().getState();
    const idx = state.users.findIndex((u) => u.id === state.sessionUserId);
    if (idx < 0) return { ok: false, msg: "请先登录" };
    const user = state.users[idx];
    const next = {
      ...user,
      nickname: patch.nickname != null ? String(patch.nickname).trim() || user.nickname : user.nickname,
      gender: patch.gender != null ? patch.gender : user.gender,
      college: patch.college != null ? String(patch.college).trim() || user.college : user.college,
      phone: patch.phone != null ? String(patch.phone).trim() : user.phone,
      realName: patch.realName != null ? String(patch.realName).trim() || user.realName : user.realName,
      avatar: patch.avatar != null ? patch.avatar : user.avatar,
    };
    if (patch.password) {
      if (String(patch.password).length < 6) return { ok: false, msg: "新密码至少 6 位" };
      next.password = String(patch.password);
    }
    state.users[idx] = next;
    store().setState(state);
    return { ok: true, user: next };
  }

  /** 对外展示的联系方式摘要（失物登记 / 互换用） */
  function contactSummary(user, mode) {
    if (!user) return "未知用户";
    if (mode === "phone" || (user.phone && mode !== "student")) {
      if (user.phone) return "手机 " + user.phone;
    }
    return (
      "学号 " +
      user.studentId +
      " · " +
      user.realName +
      (user.college ? " · " + user.college : "")
    );
  }

  function formatLostContact(item) {
    if (item.contactMode === "phone") return "手机 " + item.phone;
    return (
      "学号 " +
      item.studentId +
      " · " +
      item.studentName +
      (item.college ? " · " + item.college : "")
    );
  }

  function hasExchanged(tradeId, userA, userB) {
    const state = store().getState();
    return state.contactExchanges.some(
      (e) =>
        e.tradeId === tradeId &&
        ((e.buyerId === userA && e.sellerId === userB) || (e.buyerId === userB && e.sellerId === userA))
    );
  }

  function requestContactExchange(tradeId) {
    const state = store().getState();
    const me = currentUser();
    if (!me) return { ok: false, msg: "请先登录" };
    const trade = state.tradeItems.find((t) => t.id === tradeId);
    if (!trade) return { ok: false, msg: "物品不存在" };
    if (trade.sellerId === me.id) return { ok: false, msg: "不能与自己互换联系方式" };
    if (!me.phone && !me.studentId) return { ok: false, msg: "请先完善手机号或学号资料" };
    if (hasExchanged(tradeId, me.id, trade.sellerId)) {
      return { ok: true, already: true, msg: "已互换，可查看对方联系方式" };
    }
    state.contactExchanges.push({
      id: store().uid("ex"),
      tradeId,
      buyerId: me.id,
      sellerId: trade.sellerId,
      exchangedAt: Date.now(),
    });
    store().setState(state);
    return { ok: true, msg: "已互换联系方式，请线下当面确认成色后再交易" };
  }

  function getPeerContact(tradeId) {
    const me = currentUser();
    if (!me) return null;
    const state = store().getState();
    const ex = state.contactExchanges.find(
      (e) => e.tradeId === tradeId && (e.buyerId === me.id || e.sellerId === me.id)
    );
    if (!ex) return null;
    const otherId = me.id === ex.buyerId ? ex.sellerId : ex.buyerId;
    return state.users.find((u) => u.id === otherId) || null;
  }

  global.SHILEMA_AUTH = {
    currentUser,
    requireLogin,
    register,
    login,
    logout,
    updateProfile,
    contactSummary,
    formatLostContact,
    hasExchanged,
    requestContactExchange,
    getPeerContact,
    listUsers: users,
  };
})(window);
