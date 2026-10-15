/**
 * 本地数据层 v3 — 学院字段 + 配图 + 社区 Feed / 私信
 * 存储修复见 v1.6.1：空用户修复、配额容错
 */
(function (global) {
  const KEY = "shilema_v3";

  const defaultState = () => ({
    users: [],
    sessionUserId: null,
    lostItems: [],
    tradeItems: [],
    contactExchanges: [],
    communityPosts: [],
    communityComments: [],
    dmThreads: [],
    dmMessages: [],
    seeded: false,
    communitySeeded: false,
  });

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaultState();
      const parsed = { ...defaultState(), ...JSON.parse(raw) };
      parsed.users = Array.isArray(parsed.users) ? parsed.users : [];
      parsed.lostItems = Array.isArray(parsed.lostItems) ? parsed.lostItems : [];
      parsed.tradeItems = Array.isArray(parsed.tradeItems) ? parsed.tradeItems : [];
      parsed.contactExchanges = Array.isArray(parsed.contactExchanges) ? parsed.contactExchanges : [];
      parsed.communityPosts = Array.isArray(parsed.communityPosts) ? parsed.communityPosts : [];
      parsed.communityComments = Array.isArray(parsed.communityComments) ? parsed.communityComments : [];
      parsed.dmThreads = Array.isArray(parsed.dmThreads) ? parsed.dmThreads : [];
      parsed.dmMessages = Array.isArray(parsed.dmMessages) ? parsed.dmMessages : [];
      return parsed;
    } catch {
      return defaultState();
    }
  }

  function pruneHeavyMedia(state) {
    const next = JSON.parse(JSON.stringify(state));
    (next.communityPosts || []).forEach((p) => {
      if (p.image && String(p.image).length > 80000) p.image = "";
    });
    (next.lostItems || []).forEach((p) => {
      if (p.image && String(p.image).length > 80000) p.image = "";
    });
    (next.tradeItems || []).forEach((p) => {
      if (p.image && String(p.image).length > 80000) p.image = "";
    });
    (next.users || []).forEach((u) => {
      if (u.avatar && String(u.avatar).length > 80000) u.avatar = "";
    });
    (next.dmMessages || []).forEach((m) => {
      if (m.fileData && String(m.fileData).length > 40000) {
        m.fileData = "";
        m.text = (m.text || "") + "（附件过大已清理）";
      }
    });
    return next;
  }

  function save(state) {
    const raw = JSON.stringify(state);
    try {
      localStorage.setItem(KEY, raw);
      return { ok: true };
    } catch (err) {
      try {
        const pruned = pruneHeavyMedia(state);
        localStorage.setItem(KEY, JSON.stringify(pruned));
        Object.keys(state).forEach((k) => {
          state[k] = pruned[k];
        });
        return { ok: true, pruned: true };
      } catch (err2) {
        console.error("[拾了么] localStorage 写入失败", err2);
        return { ok: false, error: err2 };
      }
    }
  }

  function uid(prefix) {
    return prefix + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function makeDemoUsers() {
    return [
      {
        id: "user_demo_seller",
        studentId: "2021001001",
        password: "123456",
        realName: "林晓棠",
        nickname: "棠棠",
        gender: "女",
        college: "英文学院",
        phone: "13800138001",
        avatar: "",
        createdAt: Date.now() - 86400000 * 5,
      },
      {
        id: "user_demo_buyer",
        studentId: "2021002002",
        password: "123456",
        realName: "周怀远",
        nickname: "远仔",
        gender: "男",
        college: "商学院",
        phone: "13900139002",
        avatar: "",
        createdAt: Date.now() - 86400000 * 3,
      },
    ];
  }

  function ensureSeed() {
    const state = load();
    // v1.6.1：seeded 但用户空/缺演示号 → 补回演示账号，避免无法登录
    if (state.seeded) {
      let fixed = false;
      if (!state.users.length) {
        state.users = makeDemoUsers();
        state.sessionUserId = null;
        state.communitySeeded = false;
        fixed = true;
      } else {
        makeDemoUsers().forEach((demo) => {
          if (!state.users.some((u) => u.studentId === demo.studentId)) {
            state.users.push(demo);
            fixed = true;
          }
        });
      }
      if (fixed) save(state);
      return ensureCommunitySeed(state);
    }

    const [demoSeller, demoBuyer] = makeDemoUsers();
    state.users = [demoSeller, demoBuyer];
    state.lostItems = [
      {
        id: uid("lost"),
        kind: "found",
        title: "银色联想小新笔记本",
        category: "数码",
        place: "图书馆 3 楼阅览区",
        timeText: "周一上午",
        features: "A 面咖啡贴纸，壳内有 XD-17 便签",
        contactMode: "phone",
        phone: "13800138001",
        studentId: "",
        studentName: "",
        college: "",
        image: "",
        ownerId: demoSeller.id,
        status: "open",
        createdAt: Date.now() - 86400000 * 2,
      },
      {
        id: uid("lost"),
        kind: "lost",
        title: "黑色校园卡",
        category: "证件",
        place: "一食堂附近",
        timeText: "昨晚晚饭时段",
        features: "卡套有蓝色贴纸，姓名缩写 ZH",
        contactMode: "student",
        phone: "",
        studentId: "2021002002",
        studentName: "周怀远",
        college: "商学院",
        image: "",
        ownerId: demoBuyer.id,
        status: "open",
        createdAt: Date.now() - 86400000,
      },
    ];
    state.tradeItems = [
      {
        id: uid("trade"),
        title: "九成新台灯",
        category: "生活",
        condition: "九成新",
        dealType: "sell",
        priceText: "35 元 / 可置换文具",
        description: "宿舍搬家出，线材完好，可当面通电试亮。",
        place: "梅园宿舍区",
        image: "",
        sellerId: demoSeller.id,
        status: "open",
        createdAt: Date.now() - 86400000 * 1.5,
      },
      {
        id: uid("trade"),
        title: "高等数学教材",
        category: "书籍",
        condition: "有笔记",
        dealType: "exchange",
        priceText: "置换同专业英语书",
        description: "有划线笔记，封面轻微磨损，适合线下翻看后再换。",
        place: "二教门口",
        image: "",
        sellerId: demoBuyer.id,
        status: "open",
        createdAt: Date.now() - 3600000 * 10,
      },
    ];
    state.seeded = true;
    save(state);
    return ensureCommunitySeed(state);
  }

  function ensureCommunitySeed(state) {
    if (state.communitySeeded) return state;
    const seller = state.users.find((u) => u.studentId === "2021001001");
    const buyer = state.users.find((u) => u.studentId === "2021002002");
    if (!seller || !buyer) {
      state.communitySeeded = true;
      save(state);
      return state;
    }

    const p1 = {
      id: uid("cpost"),
      authorId: seller.id,
      text: "图书馆三楼靠窗座位有人落下黑色雨伞，伞柄有小熊挂件。已放到一楼失物柜，有主的同学认领时带学生证～",
      image: "",
      views: 128,
      likeIds: [buyer.id],
      pinned: true,
      pinnedAt: Date.now() - 3600000,
      createdAt: Date.now() - 86400000 * 1.2,
    };
    const p2 = {
      id: uid("cpost"),
      authorId: buyer.id,
      text: "期末周想置换一本九成新的《高级英语》，有同专业同学出的话私信我，校内面交。",
      image: "",
      views: 56,
      likeIds: [],
      pinned: false,
      pinnedAt: 0,
      createdAt: Date.now() - 3600000 * 8,
    };
    const p3 = {
      id: uid("cpost"),
      authorId: seller.id,
      text: "晨曦园傍晚风特别好，路过记得看看有没有遗落的水杯/耳机。互助从提醒一句开始。",
      image: "",
      views: 42,
      likeIds: [buyer.id],
      pinned: false,
      pinnedAt: 0,
      createdAt: Date.now() - 3600000 * 3,
    };

    state.communityPosts = [p1, p2, p3];
    state.communityComments = [
      {
        id: uid("cmt"),
        postId: p1.id,
        authorId: buyer.id,
        text: "已转告室友去看看，感谢发布！",
        createdAt: Date.now() - 3600000 * 20,
        acceptedDisclaimerAt: Date.now() - 3600000 * 20,
      },
    ];
    const threadId = uid("dm");
    state.dmThreads = [
      {
        id: threadId,
        memberIds: [seller.id, buyer.id],
        updatedAt: Date.now() - 3600000,
        lastPreview: "好的，梅园门口见",
      },
    ];
    state.dmMessages = [
      {
        id: uid("msg"),
        threadId,
        senderId: buyer.id,
        type: "text",
        text: "台灯还在吗？今晚可以面交吗？",
        fileName: "",
        fileData: "",
        createdAt: Date.now() - 3600000 * 2,
      },
      {
        id: uid("msg"),
        threadId,
        senderId: seller.id,
        type: "text",
        text: "在的，好的，梅园门口见",
        fileName: "",
        fileData: "",
        createdAt: Date.now() - 3600000,
      },
    ];
    state.communitySeeded = true;
    save(state);
    return state;
  }

  global.SHILEMA_STORE = {
    getState() {
      const s = ensureSeed();
      return ensureCommunitySeed(s);
    },
    setState(next) {
      const result = save(next);
      if (!result.ok) {
        const err = new Error("本地存储已满或不可用，登录/保存失败。请点击「重置示例数据」或清理本站图片后重试。");
        err.cause = result.error;
        throw err;
      }
      return next;
    },
    uid,
    resetDemo() {
      localStorage.removeItem(KEY);
      localStorage.removeItem("shilema_v2");
      localStorage.removeItem("shilema_legal_log");
      return ensureCommunitySeed(ensureSeed());
    },
  };
})(window);
