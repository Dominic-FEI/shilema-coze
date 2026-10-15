(function () {
  const auth = window.SHILEMA_AUTH;
  const ui = window.SHILEMA_UI;
  const params = new URLSearchParams(location.search);
  const mode = params.get("mode");
  const next = params.get("next") || "profile.html";

  function showPanel(name) {
    ["panel-login", "panel-register", "panel-profile"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.hidden = id !== name;
    });
  }

  function fillProfile(user) {
    document.getElementById("profile-avatar").src = ui.avatarSrc(user);
    document.getElementById("profile-name").textContent = user.nickname;
    document.getElementById("profile-sub").textContent =
      `学号 ${user.studentId} · ${user.college || "未填学院"} · ${user.gender} · ${user.realName}`;
    const form = document.getElementById("profile-form");
    form.nickname.value = user.nickname;
    form.gender.value = user.gender;
    form.phone.value = user.phone || "";
    form.realName.value = user.realName;
    form.college.value = user.college || "";
  }

  function bind() {
    document.getElementById("goto-register")?.addEventListener("click", (e) => {
      e.preventDefault();
      showPanel("panel-register");
    });
    document.getElementById("goto-login")?.addEventListener("click", (e) => {
      e.preventDefault();
      showPanel("panel-login");
    });

    function goAfterAuth() {
      const target = next && next.includes(".html") ? next : "profile.html";
      // 去掉 mode=login，避免登录成功后仍停在登录面板
      try {
        const url = new URL(target, location.href);
        if (url.pathname.endsWith("profile.html")) {
          url.searchParams.delete("mode");
        }
        location.href = url.pathname.split("/").pop() + url.search + url.hash;
      } catch {
        location.href = target.replace(/([?&])mode=(login|register)&?/, "$1").replace(/[?&]$/, "") || "profile.html";
      }
    }

    document.getElementById("login-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const form = e.target;
      const legalRoot = document.getElementById("login-legal");
      const legal = window.SHILEMA_LEGAL
        ? window.SHILEMA_LEGAL.assertAccepted(legalRoot)
        : { ok: false, msg: "协议组件未加载，请强制刷新页面后重试" };
      if (!legal.ok) {
        alert(legal.msg || "请先勾选同意《账号与平台服务协议》后再登录");
        return;
      }
      let res;
      try {
        res = auth.login(form.studentId.value, form.password.value);
      } catch (err) {
        alert(err.message || "登录失败：本地存储异常");
        return;
      }
      if (!res.ok) {
        alert(res.msg);
        return;
      }
      window.SHILEMA_LEGAL?.recordAcceptance("account", {
        action: "login",
        studentId: form.studentId.value.trim(),
      });
      goAfterAuth();
    });

    document.getElementById("register-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const form = e.target;
      const legalRoot = document.getElementById("register-legal");
      const legal = window.SHILEMA_LEGAL
        ? window.SHILEMA_LEGAL.assertAccepted(legalRoot)
        : { ok: false, msg: "协议组件未加载，请强制刷新页面后重试" };
      if (!legal.ok) {
        alert(legal.msg || "请先勾选同意协议后再注册");
        return;
      }
      let res;
      try {
        res = auth.register({
          studentId: form.studentId.value,
          password: form.password.value,
          realName: form.realName.value,
          nickname: form.nickname.value,
          gender: form.gender.value,
          college: form.college.value,
          phone: form.phone.value,
          acceptedAccountTosAt: Date.now(),
          acceptedAccountTosVersion: window.SHILEMA_LEGAL?.VERSION || "",
        });
      } catch (err) {
        alert(err.message || "注册失败：本地存储异常");
        return;
      }
      if (!res.ok) {
        alert(res.msg);
        return;
      }
      window.SHILEMA_LEGAL?.recordAcceptance("account", {
        action: "register",
        studentId: form.studentId.value.trim(),
        userId: res.user?.id,
      });
      goAfterAuth();
    });

    document.getElementById("profile-form")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const form = e.target;
      const file = form.avatar.files?.[0];
      let avatar;
      if (file) {
        try {
          avatar = await ui.readImageFile(file, 800 * 1024);
        } catch (err) {
          alert(err.message || "头像读取失败");
          return;
        }
      }
      const res = auth.updateProfile({
        nickname: form.nickname.value,
        gender: form.gender.value,
        phone: form.phone.value,
        realName: form.realName.value,
        college: form.college.value,
        password: form.password.value || undefined,
        avatar,
      });
      if (!res.ok) {
        alert(res.msg);
        return;
      }
      fillProfile(res.user);
      form.password.value = "";
      form.avatar.value = "";
      ui.renderShell("profile");
      alert("资料已保存，顶栏头像已更新");
    });

    document.getElementById("btn-logout")?.addEventListener("click", () => {
      auth.logout();
      location.href = "profile.html?mode=login";
    });

    document.getElementById("btn-switch")?.addEventListener("click", () => {
      auth.logout();
      location.href = "profile.html?mode=login&next=profile.html";
    });

    document.getElementById("btn-reset-demo")?.addEventListener("click", () => {
      if (confirm("将清空本地演示数据并重新注入示例。继续？")) {
        window.SHILEMA_STORE.resetDemo();
        location.reload();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    ui.renderShell("profile");
    ui.initReveal();
    window.SHILEMA_LEGAL?.mountAll();
    bind();
    const user = auth.currentUser();
    // 已登录且未强制切换账号时，直接进资料页（避免 mode=login 卡死）
    if (user && mode !== "login" && mode !== "register") {
      showPanel("panel-profile");
      fillProfile(user);
      return;
    }
    if (mode === "register") {
      showPanel("panel-register");
    } else {
      showPanel("panel-login");
    }
  });
})();
