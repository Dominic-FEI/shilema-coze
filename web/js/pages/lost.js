(function () {
  const { escapeHtml, formatTime, readImageFile } = window.SHILEMA_UI;
  const auth = window.SHILEMA_AUTH;
  const store = window.SHILEMA_STORE;

  let filter = "all";
  let query = "";
  let pendingImage = "";

  function posterLabel(ownerId) {
    const u = store.getState().users.find((x) => x.id === ownerId);
    if (!u) return "校友";
    return u.nickname + (u.college ? " · " + u.college : "");
  }

  function validateContact(form) {
    const mode = form.contactMode.value;
    if (mode === "phone") {
      const phone = form.phone.value.trim();
      if (!/^1\d{10}$/.test(phone)) return { ok: false, msg: "请填写 11 位手机号" };
      return { ok: true, contactMode: "phone", phone, studentId: "", studentName: "", college: "" };
    }
    const studentId = form.studentId.value.trim();
    const studentName = form.studentName.value.trim();
    const college = form.college.value.trim();
    if (!/^\d{6,20}$/.test(studentId)) return { ok: false, msg: "请填写完整学号（6～20 位数字）" };
    if (!studentName) return { ok: false, msg: "请填写真实姓名" };
    if (!college) return { ok: false, msg: "请填写学院" };
    return { ok: true, contactMode: "student", phone: "", studentId, studentName, college };
  }

  function syncContactFields(form) {
    const mode = form.contactMode.value;
    form.querySelector('[data-contact="phone"]').hidden = mode !== "phone";
    form.querySelector('[data-contact="student"]').hidden = mode !== "student";
  }

  function haystack(it) {
    return [
      it.title,
      it.category,
      it.place,
      it.timeText,
      it.features,
      it.phone,
      it.studentId,
      it.studentName,
      it.college,
      it.kind === "found" ? "拾获" : "寻物",
      posterLabel(it.ownerId),
    ]
      .join(" ")
      .toLowerCase();
  }

  function filteredItems() {
    const q = query.trim().toLowerCase();
    return store
      .getState()
      .lostItems.slice()
      .sort((a, b) => b.createdAt - a.createdAt)
      .filter((it) => (filter === "all" ? true : it.kind === filter))
      .filter((it) => (q ? haystack(it).includes(q) : true));
  }

  function mediaBlock(it) {
    if (!it.image) return "";
    return `<img class="media-thumb media-thumb--sm" src="${escapeHtml(it.image)}" alt="${escapeHtml(it.title)} 配图" />`;
  }

  function renderList() {
    const root = document.getElementById("lost-list");
    const countEl = document.getElementById("lost-count");
    if (!root) return;
    const items = filteredItems();
    if (countEl) {
      countEl.textContent = query.trim()
        ? `找到 ${items.length} 条 · 按发布时间从新到旧`
        : `共 ${items.length} 条 · 按发布时间从新到旧`;
    }

    if (!items.length) {
      root.innerHTML = `<div class="empty">${
        query.trim() ? "没有匹配关键字的帖子，试试其他词或清除搜索。" : "暂无发布。点击右上角「+」登记失物或寻物。"
      }</div>`;
      return;
    }

    root.innerHTML = items
      .map((it) => {
        const kindLabel = it.kind === "found" ? "拾获" : "寻物";
        const badge = it.kind === "found" ? "badge--success" : "badge--warning";
        return `
        <article class="item-row">
          <div class="item-row__media">
            ${mediaBlock(it)}
            <div class="item-row__media-body">
              <div class="item-row__head">
                <h3 class="item-row__title">${escapeHtml(it.title)}</h3>
                <span class="badge ${badge}">${kindLabel}</span>
              </div>
              <p class="item-row__meta">${escapeHtml(it.category)} · ${escapeHtml(it.place)} · ${escapeHtml(it.timeText || "")}</p>
              <p class="item-row__poster">发布者 ${escapeHtml(posterLabel(it.ownerId))} · ${formatTime(it.createdAt)}</p>
              <p class="item-row__body">${escapeHtml(it.features)}</p>
            </div>
          </div>
          <div class="item-row__foot">
            <div class="contact-box">
              <strong>登记联系方式</strong>
              ${escapeHtml(auth.formatLostContact(it))}
            </div>
          </div>
        </article>`;
      })
      .join("");
  }

  function setComposerOpen(open) {
    const panel = document.getElementById("lost-composer");
    const fab = document.getElementById("lost-fab");
    if (!panel || !fab) return;
    panel.hidden = !open;
    fab.setAttribute("aria-expanded", open ? "true" : "false");
    fab.textContent = open ? "×" : "+";
    fab.title = open ? "收起登记" : "发布登记";
    if (open) {
      const me = auth.requireLogin("lost.html");
      if (!me) {
        panel.hidden = true;
        fab.setAttribute("aria-expanded", "false");
        fab.textContent = "+";
      }
    }
  }

  function fillUserDefaults(form) {
    const user = auth.currentUser();
    if (!user) return;
    if (user.phone) form.phone.value = user.phone;
    form.studentId.value = user.studentId;
    form.studentName.value = user.realName;
    if (form.college) form.college.value = user.college || "";
  }

  function bind() {
    document.getElementById("lost-fab")?.addEventListener("click", () => {
      const panel = document.getElementById("lost-composer");
      setComposerOpen(!!panel?.hidden);
    });
    document.getElementById("lost-composer-close")?.addEventListener("click", () => setComposerOpen(false));

    const search = document.getElementById("lost-search");
    const clearBtn = document.getElementById("lost-search-clear");
    search?.addEventListener("input", () => {
      query = search.value;
      if (clearBtn) clearBtn.hidden = !query.trim();
      renderList();
    });
    clearBtn?.addEventListener("click", () => {
      query = "";
      if (search) search.value = "";
      clearBtn.hidden = true;
      renderList();
    });

    document.querySelectorAll("[data-filter]").forEach((btn) => {
      btn.addEventListener("click", () => {
        filter = btn.getAttribute("data-filter");
        document.querySelectorAll("[data-filter]").forEach((b) => b.classList.toggle("is-active", b === btn));
        renderList();
      });
    });

    const form = document.getElementById("lost-form");
    if (!form) return;

    form.querySelectorAll('input[name="contactMode"]').forEach((r) => {
      r.addEventListener("change", () => syncContactFields(form));
    });
    syncContactFields(form);
    fillUserDefaults(form);

    form.image?.addEventListener("change", async () => {
      const file = form.image.files?.[0];
      const preview = document.getElementById("lost-image-preview");
      try {
        pendingImage = file ? await readImageFile(file) : "";
        if (preview) {
          preview.hidden = !pendingImage;
          preview.src = pendingImage || "";
        }
      } catch (err) {
        alert(err.message || "图片读取失败");
        form.image.value = "";
        pendingImage = "";
      }
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const me = auth.requireLogin("lost.html");
      if (!me) return;

      const legal = window.SHILEMA_LEGAL?.assertAccepted(document.getElementById("lost-legal"));
      if (legal && !legal.ok) {
        alert(legal.msg);
        return;
      }

      const contact = validateContact(form);
      if (!contact.ok) {
        alert(contact.msg);
        return;
      }
      const title = form.title.value.trim();
      if (!title) {
        alert("请填写物品名称");
        return;
      }

      const state = store.getState();
      state.lostItems.unshift({
        id: store.uid("lost"),
        kind: form.kind.value,
        title,
        category: form.category.value.trim() || "其他",
        place: form.place.value.trim() || "未填写",
        timeText: form.timeText.value.trim() || formatTime(Date.now()),
        features: form.features.value.trim() || "暂无特征说明",
        contactMode: contact.contactMode,
        phone: contact.phone,
        studentId: contact.studentId,
        studentName: contact.studentName,
        college: contact.college,
        image: pendingImage,
        ownerId: me.id,
        status: "open",
        acceptedPublishAt: Date.now(),
        acceptedPublishVersion: window.SHILEMA_LEGAL?.VERSION || "",
        createdAt: Date.now(),
      });
      store.setState(state);
      window.SHILEMA_LEGAL?.recordAcceptance("publish", {
        action: "lost",
        userId: me.id,
        kind: form.kind.value,
      });
      form.reset();
      pendingImage = "";
      const preview = document.getElementById("lost-image-preview");
      if (preview) {
        preview.hidden = true;
        preview.src = "";
      }
      fillUserDefaults(form);
      form.contactMode.value = "phone";
      syncContactFields(form);
      window.SHILEMA_LEGAL?.reset(document.getElementById("lost-legal"));
      setComposerOpen(false);
      renderList();
      alert("发布成功，已出现在信息流顶部");
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    window.SHILEMA_UI.renderShell("lost");
    window.SHILEMA_UI.initReveal();
    window.SHILEMA_LEGAL?.mountAll();
    bind();
    renderList();
  });
})();
