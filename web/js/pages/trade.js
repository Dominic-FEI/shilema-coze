(function () {
  const { escapeHtml, formatTime, readImageFile } = window.SHILEMA_UI;
  const auth = window.SHILEMA_AUTH;
  const store = window.SHILEMA_STORE;

  let pendingTradeId = null;
  let pendingImage = "";
  let query = "";

  function sellerLabel(sellerId) {
    const u = store.getState().users.find((x) => x.id === sellerId);
    if (!u) return "校友";
    return u.nickname + (u.college ? " · " + u.college : "");
  }

  function haystack(it) {
    return [
      it.title,
      it.category,
      it.condition,
      it.place,
      it.priceText,
      it.description,
      it.dealType === "exchange" ? "置换" : "转让",
      sellerLabel(it.sellerId),
    ]
      .join(" ")
      .toLowerCase();
  }

  function filteredItems() {
    const q = query.trim().toLowerCase();
    return store
      .getState()
      .tradeItems.slice()
      .sort((a, b) => b.createdAt - a.createdAt)
      .filter((it) => (q ? haystack(it).includes(q) : true));
  }

  function renderPeerBox(tradeId) {
    const peer = auth.getPeerContact(tradeId);
    if (!peer) return "";
    const lines = [];
    if (peer.phone) lines.push("手机 " + peer.phone);
    lines.push(
      "学号 " + peer.studentId + " · " + peer.realName + (peer.college ? " · " + peer.college : "")
    );
    lines.push("昵称 " + peer.nickname);
    return `
      <div class="contact-box">
        <strong>对方联系方式（已互换 · 请线下看成色）</strong>
        ${escapeHtml(lines.join(" ｜ "))}
      </div>`;
  }

  function mediaBlock(it) {
    if (!it.image) return "";
    return `<img class="media-thumb media-thumb--sm" src="${escapeHtml(it.image)}" alt="${escapeHtml(it.title)} 配图" />`;
  }

  function renderList() {
    const root = document.getElementById("trade-list");
    const countEl = document.getElementById("trade-count");
    if (!root) return;
    const me = auth.currentUser();
    const items = filteredItems();
    if (countEl) {
      countEl.textContent = query.trim()
        ? `找到 ${items.length} 条 · 按发布时间从新到旧`
        : `共 ${items.length} 条 · 按发布时间从新到旧`;
    }

    if (!items.length) {
      root.innerHTML = `<div class="empty">${
        query.trim() ? "没有匹配关键字的闲置，试试其他词或清除搜索。" : "暂无闲置。点击右上角「+」发布转让或置换。"
      }</div>`;
      return;
    }

    root.innerHTML = items
      .map((it) => {
        const exchanged =
          me &&
          (auth.hasExchanged(it.id, me.id, it.sellerId) ||
            (me.id === it.sellerId &&
              store.getState().contactExchanges.some((e) => e.tradeId === it.id)));
        const isSeller = me && me.id === it.sellerId;
        let action = "";
        if (!me) {
          action = `<a class="btn btn--ghost" href="profile.html?mode=login&next=trade.html">登录后申请互换</a>`;
        } else if (isSeller) {
          action = exchanged
            ? `<span class="badge badge--success">已有买家互换</span>`
            : `<span class="text-muted">等待买家申请互换</span>`;
        } else if (exchanged) {
          action = `<span class="badge badge--success">已互换</span>`;
        } else {
          action = `<button type="button" class="btn btn--secondary" data-exchange="${it.id}">申请互换联系方式</button>`;
        }

        return `
        <article class="item-row">
          <div class="item-row__media">
            ${mediaBlock(it)}
            <div class="item-row__media-body">
              <div class="item-row__head">
                <h3 class="item-row__title">${escapeHtml(it.title)}</h3>
                <span class="badge badge--neutral">${escapeHtml(it.condition)}</span>
              </div>
              <p class="item-row__meta">${escapeHtml(it.category)} · ${escapeHtml(it.place)}</p>
              <p class="item-row__poster">发布者 ${escapeHtml(sellerLabel(it.sellerId))} · ${formatTime(it.createdAt)}</p>
              <p class="item-row__body">${escapeHtml(it.description)}</p>
            </div>
          </div>
          <div class="item-row__foot">
            <span class="item-row__price">${escapeHtml(it.priceText)}</span>
            ${action}
          </div>
          ${
            exchanged
              ? renderPeerBox(it.id)
              : `<p class="item-row__meta">联系方式默认隐藏；互换后双方可见，线下当面确认成色。</p>`
          }
        </article>`;
      })
      .join("");

    root.querySelectorAll("[data-exchange]").forEach((btn) => {
      btn.addEventListener("click", () => openModal(btn.getAttribute("data-exchange")));
    });
  }

  function setComposerOpen(open) {
    const panel = document.getElementById("trade-composer");
    const fab = document.getElementById("trade-fab");
    if (!panel || !fab) return;
    panel.hidden = !open;
    fab.setAttribute("aria-expanded", open ? "true" : "false");
    fab.textContent = open ? "×" : "+";
    fab.title = open ? "收起发布" : "发布闲置";
    if (open) {
      const me = auth.requireLogin("trade.html");
      if (!me) {
        panel.hidden = true;
        fab.setAttribute("aria-expanded", "false");
        fab.textContent = "+";
      }
    }
  }

  function openModal(tradeId) {
    pendingTradeId = tradeId;
    const modal = document.getElementById("exchange-modal");
    const ack = document.getElementById("exchange-ack");
    const err = document.getElementById("exchange-ack-error");
    if (ack) ack.checked = false;
    if (err) err.hidden = true;
    if (modal) modal.hidden = false;
  }

  function closeModal() {
    pendingTradeId = null;
    const modal = document.getElementById("exchange-modal");
    const ack = document.getElementById("exchange-ack");
    const err = document.getElementById("exchange-ack-error");
    if (ack) ack.checked = false;
    if (err) err.hidden = true;
    if (modal) modal.hidden = true;
  }

  function bind() {
    document.getElementById("trade-fab")?.addEventListener("click", () => {
      const panel = document.getElementById("trade-composer");
      setComposerOpen(!!panel?.hidden);
    });
    document.getElementById("trade-composer-close")?.addEventListener("click", () => setComposerOpen(false));

    const search = document.getElementById("trade-search");
    const clearBtn = document.getElementById("trade-search-clear");
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

    const form = document.getElementById("trade-form");
    form?.image?.addEventListener("change", async () => {
      const file = form.image.files?.[0];
      const preview = document.getElementById("trade-image-preview");
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

    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      const me = auth.requireLogin("trade.html");
      if (!me) return;

      const legal = window.SHILEMA_LEGAL?.assertAccepted(document.getElementById("trade-legal"));
      if (legal && !legal.ok) {
        alert(legal.msg);
        return;
      }

      if (!me.phone) {
        const go = confirm("建议先完善手机号，方便对方联系。是否前往个人主页？");
        if (go) {
          location.href = "profile.html";
          return;
        }
      }
      const title = form.title.value.trim();
      if (!title) {
        alert("请填写物品名称");
        return;
      }
      const state = store.getState();
      state.tradeItems.unshift({
        id: store.uid("trade"),
        title,
        category: form.category.value.trim() || "其他",
        condition: form.condition.value.trim() || "请当面看货",
        dealType: form.dealType.value,
        priceText: form.priceText.value.trim() || (form.dealType.value === "exchange" ? "仅置换" : "面议"),
        description: form.description.value.trim() || "暂无补充说明",
        place: form.place.value.trim() || "校内面交",
        image: pendingImage,
        sellerId: me.id,
        status: "open",
        acceptedPublishAt: Date.now(),
        acceptedPublishVersion: window.SHILEMA_LEGAL?.VERSION || "",
        createdAt: Date.now(),
      });
      store.setState(state);
      window.SHILEMA_LEGAL?.recordAcceptance("publish", {
        action: "trade",
        userId: me.id,
        dealType: form.dealType.value,
      });
      form.reset();
      pendingImage = "";
      const preview = document.getElementById("trade-image-preview");
      if (preview) {
        preview.hidden = true;
        preview.src = "";
      }
      window.SHILEMA_LEGAL?.reset(document.getElementById("trade-legal"));
      setComposerOpen(false);
      renderList();
      alert("发布成功，已出现在信息流顶部");
    });

    document.getElementById("exchange-confirm")?.addEventListener("click", () => {
      if (!pendingTradeId) return;
      const me = auth.requireLogin("trade.html");
      if (!me) return;
      const ack = document.getElementById("exchange-ack");
      const err = document.getElementById("exchange-ack-error");
      if (!ack?.checked) {
        if (err) err.hidden = false;
        ack?.focus();
        return;
      }
      if (err) err.hidden = true;
      const res = auth.requestContactExchange(pendingTradeId);
      if (res.ok) {
        window.SHILEMA_LEGAL?.recordAcceptance("publish", {
          action: "exchange",
          userId: me.id,
          tradeId: pendingTradeId,
        });
      }
      alert(res.msg || (res.ok ? "成功" : "失败"));
      closeModal();
      renderList();
    });
    document.getElementById("exchange-ack")?.addEventListener("change", () => {
      const err = document.getElementById("exchange-ack-error");
      if (err && document.getElementById("exchange-ack")?.checked) err.hidden = true;
    });
    document.getElementById("exchange-cancel")?.addEventListener("click", closeModal);
    document.querySelector("#exchange-modal .modal__backdrop")?.addEventListener("click", closeModal);
  }

  document.addEventListener("DOMContentLoaded", () => {
    window.SHILEMA_UI.renderShell("trade");
    window.SHILEMA_UI.initReveal();
    window.SHILEMA_LEGAL?.mountAll();
    bind();
    renderList();
  });
})();
