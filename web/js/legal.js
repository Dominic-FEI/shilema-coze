/**
 * 拾了么 · 法定告知与勾选确认（共用组件）
 * 参考校园 Lost&Found / 二手互易常见 ToS：必读滚动区 + 默认未勾选 + 提交前强校验
 * 文案依据《民法典》《网络安全法》《个人信息保护法》等原则整理，非正式法律意见
 */
(function (global) {
  const VERSION = "2026-10-14";

  const DOCS = {
    account: {
      id: "account-tos",
      title: "拾了么账号与平台服务协议",
      lead: "注册或登录前请完整阅读。本协议侧重账号真实、个人信息处理与平台信息中介免责。",
      checkbox:
        "我已逐条阅读并同意《拾了么账号与平台服务协议》及个人信息处理告知（未勾选无法注册/登录）",
      sections: [
        {
          h: "一、平台性质与主体界定",
          p: [
            "「拾了么」为面向西安外国语大学师生的校园互助信息展示工具（含演示环境），提供失物招领与闲置信息发布、浏览、检索及联系方式互换等功能。",
            "本平台并非学校官方信息系统，亦不构成担保机构、支付机构或线下交易的合同相对方。平台仅提供信息中介与展示通道，不代收代付、不托管财物、不承诺撮合成功。",
          ],
        },
        {
          h: "二、账号真实与安全义务",
          p: [
            "您承诺以本人学号注册，所填姓名、学院、手机号等资料真实、准确、完整；禁止冒用他人学号或身份信息。",
            "您应妥善保管账号与密码。因您自身泄露、出借账号或保管不善导致的损失，由您自行承担。发现异常登录应及时修改密码并停止使用。",
            "平台有权对涉嫌虚假注册、冒用身份、扰乱秩序的账号采取限制使用、注销等措施（演示环境可重置本地数据）。",
          ],
        },
        {
          h: "三、个人信息处理告知（同意）",
          p: [
            "为提供账号服务与互助功能，我们将处理您主动提交的：学号、姓名、昵称、性别、学院、手机号、头像及您发布内容中的联系信息。",
            "处理目的限于：身份识别、信息展示、失物/闲置联络、安全风控与本地演示。演示版数据默认保存在本机浏览器（localStorage），请勿在不可信设备上填写敏感信息。",
            "依据《中华人民共和国个人信息保护法》，您有权查询、更正、删除本机资料；注销或清除本地数据后，相应信息将不再保留于本设备。您勾选本协议即视为知悉并同意上述处理规则。",
          ],
        },
        {
          h: "四、用户行为底线",
          p: [
            "不得利用本平台从事欺诈、骚扰、泄露他人隐私、发布违法违规信息或侵害他人合法权益的行为。",
            "不得将互换获得的联系方式用于与互助无关的营销、骚扰或非法用途。",
            "您应遵守学校管理规定及国家法律法规；因违规行为导致的法律责任由行为人自行承担。",
          ],
        },
        {
          h: "五、平台免责与责任限制",
          p: [
            "在法律允许的最大范围内，本平台按「现状」提供，不对信息的完整性、时效性、可用性作默示担保，亦不保证失物必然找回或闲置必然成交。",
            "用户之间因线下交接、交易、沟通产生的争议、损害、人身或财产损失，由相关责任方依据《中华人民共和国民法典》等法律自行解决；平台不承担担保、垫付或连带责任，但法律法规另有强制规定的除外。",
            "因不可抗力、网络故障、浏览器限制、第三方服务（含 AI 助手）中断等非平台可控原因导致的服务中断或数据异常，平台在合理范围内免责。",
          ],
        },
        {
          h: "六、协议生效与变更",
          p: [
            "您勾选并完成注册或登录，即表示已阅读、理解并同意受本协议约束。不同意请停止注册/登录。",
            "协议可能随功能迭代更新；重大变更将在本组件内展示新版本号。继续使用即视为接受更新后的条款。",
            "本协议适用中华人民共和国法律。争议协商不成的，可向有管辖权的人民法院提起诉讼。",
          ],
        },
      ],
    },
    publish: {
      id: "publish-liability",
      title: "发布与交易责任声明",
      lead: "每次发帖前须重新确认。本声明侧重内容真实、遗失物义务、买卖双方责任与线下风险自担。",
      checkbox:
        "我已逐条阅读并同意《发布与交易责任声明》，愿对本次发布内容及线下后果自行负责（未勾选无法发布）",
      sections: [
        {
          h: "一、发布内容真实义务",
          p: [
            "您保证本次发布的物品名称、特征、地点、时间、成色、价格/置换说明及配图真实、合法，不虚构拾获/寻物事实，不夸大成色或隐瞒重大瑕疵。",
            "禁止发布虚假信息、重复刷帖、误导性描述，以及侵犯他人肖像、隐私或知识产权的图片与文字。",
            "若因虚假发布导致他人损失或引发纠纷，由发布者依法承担相应民事责任；情节严重的可能承担其他法律责任。",
          ],
        },
        {
          h: "二、失物招领专项（拾得人 / 寻物人）",
          p: [
            "依据《中华人民共和国民法典》关于遗失物的规定，拾得遗失物应当及时通知权利人；无法通知的，可送交有关部门或通过正当渠道招领。禁止侵占他人遗失物。",
            "寻物发布不得虚构丢失事实以套取他人财物或信息。认领时应配合核验权属特征；无法证明权属的，对方有权拒绝交接。",
            "高价值物品、证件类物品建议优先通过学校保卫处、失物招领点或公安机关等正规渠道处理；本平台信息流不能替代法定招领程序。",
          ],
        },
        {
          h: "三、闲置交易专项（卖方 / 买方）",
          p: [
            "卖方保证对所售/置换物品享有处分权，物品来源合法，成色与配件说明与实物相符；禁止销售禁售品、赃物、侵权复制品及学校/法律禁止流转的物品。",
            "买方应在互换联系后于公共场所当面查验成色、功能与完整性，再行交付；「非当面看货成交」的风险由自愿方自担。",
            "平台不介入议价、质检、物流与资金结算。买卖双方之间的合同关系在线下成立与履行，适用《民法典》合同编等规定；质量争议、退换与违约责任由双方自行协商或依法解决。",
          ],
        },
        {
          h: "四、线下安全与见面规范",
          p: [
            "建议在校内公共区域、白天人流较多处当面交接；不要前往偏僻地点，不要预付大额定金至陌生账户。",
            "因见面、交接、运输过程中发生的人身损害、财产损失、诈骗或盗窃等，由侵权人或相关责任方依法承担责任；平台无法实地监管线下行为。",
          ],
        },
        {
          h: "五、联系方式互换与隐私",
          p: [
            "互换后双方可见的手机号、学号、姓名、学院等仅可用于本次互助/交易沟通，不得传播、出售或用于其他目的。",
            "您上传的配图若含可识别他人面部或宿舍门牌等信息，请自行打码；由此产生的隐私争议由上传者负责。",
          ],
        },
        {
          h: "六、平台角色再次确认",
          p: [
            "勾选本声明并提交发布，即确认：平台仅为信息发布通道；您是本次信息的责任主体；线下一切风险与法律后果由您及交易/交接相对方自行承担（法律另有规定除外）。",
            "平台可对明显违法、侵权或虚假的帖子采取隐藏、删除等处理（演示环境为本地数据操作），但不构成对全部内容的事先审查义务。",
          ],
        },
      ],
    },
    comment: {
      id: "comment-speech",
      title: "评论言论与网络安全责任声明",
      lead: "发表评论前须完整阅读至少 10 秒。本声明侧重言论安全、禁止不良内容与违法信息。",
      checkbox: "我已阅读满 10 秒并同意《评论言论与网络安全责任声明》（未确认无法评论）",
      sections: [
        {
          h: "一、合法文明发言",
          p: [
            "评论仅可用于与帖子相关的善意交流。禁止发布淫秽、暴力、仇恨、歧视、谣言、骚扰侮辱及任何违反《网络安全法》《治安管理处罚法》的内容。",
            "禁止上传或外链不良图片、涉政敏感伪造信息、侵犯他人隐私的截图或人肉搜索材料。",
          ],
        },
        {
          h: "二、责任自负",
          p: [
            "您对本人评论的真实性与合法性独立负责。因不当言论导致的投诉、封禁、民事或行政责任由发布者自行承担。",
            "平台可删除明显违法或有害评论（演示环境为本地隐藏/删除），但不构成事先审查义务。",
          ],
        },
        {
          h: "三、未成年人与校园秩序",
          p: [
            "请尊重师生与校园公共秩序；发现违法线索应向学校或公安机关报告，而非在评论区扩散。",
          ],
        },
      ],
    },
  };

  function escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderSections(sections) {
    return sections
      .map(
        (s) => `
      <section class="legal-consent__block">
        <h4 class="legal-consent__h">${escapeHtml(s.h)}</h4>
        ${s.p.map((line) => `<p class="legal-consent__p">${escapeHtml(line)}</p>`).join("")}
      </section>`
      )
      .join("");
  }

  function buildHtml(kind) {
    const doc = DOCS[kind];
    if (!doc) return "";
    const inputId = `legal-check-${kind}-${Math.random().toString(36).slice(2, 8)}`;
    return `
    <aside class="legal-consent" data-legal-kind="${escapeHtml(kind)}" data-legal-version="${VERSION}" data-legal-id="${escapeHtml(doc.id)}">
      <header class="legal-consent__head">
        <p class="legal-consent__eyebrow">法定告知 · 必读 · v${VERSION}</p>
        <h3 class="legal-consent__title">${escapeHtml(doc.title)}</h3>
        <p class="legal-consent__lead">${escapeHtml(doc.lead)}</p>
      </header>
      <div class="legal-consent__scroll" tabindex="0" role="region" aria-label="${escapeHtml(doc.title)}全文">
        ${renderSections(doc.sections)}
        <p class="legal-consent__foot">参考原则：《民法典》《网络安全法》《个人信息保护法》；校园 Lost&amp;Found / 二手互易常见 ToS（如 CampusClaim、ReclaimX 等）中的责任限制与当面交接安全条款。本文不构成律师意见。</p>
      </div>
      <label class="legal-consent__check" for="${inputId}">
        <input type="checkbox" id="${inputId}" name="legalAccepted" value="1" data-legal-checkbox />
        <span class="legal-consent__check-text">${escapeHtml(doc.checkbox)}</span>
      </label>
      <p class="legal-consent__error" data-legal-error hidden role="alert">请先勾选同意上述声明后再继续。</p>
    </aside>`;
  }

  function mount(target, kind) {
    const el = typeof target === "string" ? document.querySelector(target) : target;
    if (!el || !DOCS[kind]) return null;
    el.innerHTML = buildHtml(kind);
    const root = el.querySelector(".legal-consent");
    const box = root?.querySelector("[data-legal-checkbox]");
    const err = root?.querySelector("[data-legal-error]");
    box?.addEventListener("change", () => {
      if (box.checked && err) err.hidden = true;
      root?.classList.toggle("is-accepted", !!box.checked);
      root?.classList.remove("is-invalid");
    });
    return root;
  }

  function mountAll(scope) {
    const root = scope || document;
    root.querySelectorAll("[data-legal-mount]").forEach((node) => {
      const kind = node.getAttribute("data-legal-mount");
      mount(node, kind);
    });
  }

  function findRoot(from) {
    if (!from) return null;
    if (from.classList?.contains("legal-consent")) return from;
    return from.querySelector?.(".legal-consent") || from.closest?.(".legal-consent") || null;
  }

  function isAccepted(from) {
    const root = findRoot(from);
    const box = root?.querySelector("[data-legal-checkbox]");
    return !!(box && box.checked);
  }

  /** @returns {{ ok: boolean, msg?: string }} */
  function assertAccepted(from) {
    const root = findRoot(from);
    if (!root) return { ok: false, msg: "未找到协议确认组件" };
    const box = root.querySelector("[data-legal-checkbox]");
    const err = root.querySelector("[data-legal-error]");
    if (box && box.checked) {
      if (err) err.hidden = true;
      root.classList.remove("is-invalid");
      return { ok: true };
    }
    if (err) err.hidden = false;
    root.classList.add("is-invalid");
    root.scrollIntoView({ behavior: "smooth", block: "nearest" });
    return { ok: false, msg: "请先勾选同意协议声明后再继续" };
  }

  function reset(from) {
    const root = findRoot(from);
    if (!root) return;
    const box = root.querySelector("[data-legal-checkbox]");
    const err = root.querySelector("[data-legal-error]");
    if (box) box.checked = false;
    if (err) err.hidden = true;
    root.classList.remove("is-accepted", "is-invalid");
  }

  function recordAcceptance(kind, meta) {
    try {
      const key = "shilema_legal_log";
      const prev = JSON.parse(localStorage.getItem(key) || "[]");
      prev.push({
        kind,
        version: VERSION,
        at: Date.now(),
        docId: DOCS[kind]?.id || kind,
        ...(meta || {}),
      });
      localStorage.setItem(key, JSON.stringify(prev.slice(-40)));
    } catch (_) {
      /* ignore quota */
    }
  }

  /**
   * 评论前强制阅读倒计时（默认 10 秒）后再允许勾选确认
   * @returns {Promise<boolean>} 用户确认 true / 取消 false
   */
  function openWaitGate(kind, seconds) {
    const doc = DOCS[kind || "comment"];
    const waitSec = Math.max(1, seconds || 10);
    return new Promise((resolve) => {
      const wrap = document.createElement("div");
      wrap.className = "legal-wait";
      wrap.innerHTML = `
        <div class="legal-wait__backdrop" data-wait-cancel></div>
        <div class="legal-wait__dialog" role="dialog" aria-modal="true" aria-labelledby="legal-wait-title">
          <header class="legal-wait__head">
            <p class="legal-consent__eyebrow">强制阅读 · ${waitSec} 秒</p>
            <h3 class="legal-wait__title" id="legal-wait-title">${escapeHtml(doc.title)}</h3>
            <p class="legal-consent__lead">${escapeHtml(doc.lead)}</p>
          </header>
          <div class="legal-consent__scroll legal-wait__scroll" tabindex="0">
            ${renderSections(doc.sections)}
          </div>
          <div class="legal-wait__actions">
            <button type="button" class="btn btn--ghost" data-wait-cancel>取消</button>
            <button type="button" class="btn btn--primary" data-wait-ok disabled>
              请阅读（还剩 <span data-wait-sec>${waitSec}</span> 秒）
            </button>
          </div>
          <label class="legal-consent__check legal-wait__check" hidden data-wait-check-wrap>
            <input type="checkbox" data-wait-check />
            <span class="legal-consent__check-text">${escapeHtml(doc.checkbox)}</span>
          </label>
        </div>`;
      document.body.appendChild(wrap);

      const okBtn = wrap.querySelector("[data-wait-ok]");
      const secEl = wrap.querySelector("[data-wait-sec]");
      const checkWrap = wrap.querySelector("[data-wait-check-wrap]");
      const check = wrap.querySelector("[data-wait-check]");
      let left = waitSec;
      let timer = setInterval(() => {
        left -= 1;
        if (secEl) secEl.textContent = String(Math.max(0, left));
        if (left <= 0) {
          clearInterval(timer);
          timer = null;
          if (checkWrap) checkWrap.hidden = false;
          if (okBtn) {
            okBtn.disabled = false;
            okBtn.textContent = "确认并继续评论";
          }
        }
      }, 1000);

      function close(ok) {
        if (timer) clearInterval(timer);
        wrap.remove();
        if (ok) recordAcceptance(kind || "comment", { action: "wait-gate" });
        resolve(ok);
      }

      wrap.querySelectorAll("[data-wait-cancel]").forEach((el) => {
        el.addEventListener("click", () => close(false));
      });
      okBtn?.addEventListener("click", () => {
        if (okBtn.disabled) return;
        if (!check?.checked) {
          alert("请勾选同意声明后再继续");
          return;
        }
        close(true);
      });
    });
  }

  global.SHILEMA_LEGAL = {
    VERSION,
    DOCS,
    mount,
    mountAll,
    isAccepted,
    assertAccepted,
    reset,
    recordAcceptance,
    openWaitGate,
  };
})(window);
