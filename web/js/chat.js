/**
 * 扣子 Chat SDK 初始化
 * UI 文案与品牌一致；样式以 SDK 自身为主，本站不做蓝紫覆盖。
 */
(function () {
  const cfg = window.SHILEMA_CONFIG;

  function isPlaceholder(value) {
    return !value || String(value).includes("请填");
  }

  function initChat() {
    if (!cfg || isPlaceholder(cfg.botId) || isPlaceholder(cfg.pat)) {
      console.warn("[拾了么] 未配置 BOT_ID / PAT，跳过 Chat SDK 初始化。");
      window.SHILEMA_CHAT = {
        open() {
          alert("请先在 web/js/config.js 填写 BOT_ID 与 PAT 后再试。");
        },
      };
      return;
    }

    if (typeof window.CozeWebSDK === "undefined") {
      console.error("[拾了么] CozeWebSDK 未加载，请检查 script 地址是否为扣子安装指引最新版。");
      window.SHILEMA_CHAT = {
        open() {
          alert("Chat SDK 未加载，请检查网络或脚本地址。");
        },
      };
      return;
    }

    const session = window.SHILEMA_AUTH?.currentUser?.();
    const client = new CozeWebSDK.WebChatClient({
      config: {
        type: "bot",
        bot_id: cfg.botId,
        isIframe: false,
      },
      auth: {
        type: "token",
        token: cfg.pat,
        onRefreshToken: async () => cfg.pat,
      },
      userInfo: {
        id: session?.studentId || cfg.user.id,
        nickname: session?.nickname || cfg.user.nickname,
        url: session?.avatar || cfg.user.url || "",
      },
      ui: {
        base: { lang: "zh-CN" },
        asstBtn: { isNeed: true },
        footer: {
          isShow: true,
          expressionText: cfg.ui.footerText,
        },
        chatBot: {
          title: cfg.ui.title,
          uploadable: true,
        },
      },
    });

    window.SHILEMA_CHAT = {
      client,
      open() {
        try {
          if (typeof client.showChatBot === "function") {
            client.showChatBot();
            return;
          }
          if (typeof client.open === "function") {
            client.open();
            return;
          }
          const btn = document.querySelector('[class*="assistant"], [class*="chat-btn"], [id*="coze"]');
          if (btn) btn.click();
          else alert("请点击页面右下角对话按钮打开助手。");
        } catch (err) {
          console.error(err);
          alert("请点击页面右下角对话按钮打开助手。");
        }
      },
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initChat);
  } else {
    initChat();
  }
})();
