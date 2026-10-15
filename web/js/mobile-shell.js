/**
 * 移动社区共用：帖卡渲染（导航统一走产品顶栏 site-header，无五栏条）
 */
(function (global) {
  function renderPostCard(post, opts) {
    const ui = global.SHILEMA_UI;
    const com = global.SHILEMA_COMMUNITY;
    const me = global.SHILEMA_AUTH?.currentUser();
    const author = com.userById(post.authorId);
    const liked = me && (post.likeIds || []).includes(me.id);
    const comments = com.commentCount(post.id);
    const clamp = opts?.clamp !== false;
    const link = opts?.link !== false;
    const avatar = ui.avatarSrc(author);
    const name = ui.escapeHtml(author?.nickname || "校友");
    const time = ui.formatTime(post.createdAt);
    const text = ui.escapeHtml(post.text);
    const pin = post.pinned
      ? `<span class="post-card__pin">置顶</span>`
      : "";
    const media = post.image
      ? `<img class="post-card__media" src="${ui.escapeHtml(post.image)}" alt="配图" />`
      : "";
    const bodyClass = clamp ? "post-card__body post-card__body--clamp" : "post-card__body";
    const openAttr = link ? `data-open-post="${ui.escapeHtml(post.id)}"` : "";

    return `
      <article class="post-card ${post.pinned ? "post-card--pinned" : ""}" ${openAttr}>
        <div class="post-card__head">
          <img class="avatar avatar--sm" src="${ui.escapeHtml(avatar)}" alt="" width="40" height="40" />
          <div class="post-card__meta">
            <p class="post-card__name">${name}</p>
            <p class="post-card__time">${time}</p>
          </div>
          ${pin}
        </div>
        <p class="${bodyClass}">${text}</p>
        ${media}
        <div class="post-card__foot" data-stop>
          <span class="post-card__stat">阅读 ${post.views || 0}</span>
          <button type="button" class="post-card__action" data-comment="${ui.escapeHtml(post.id)}">评论 ${comments}</button>
          <button type="button" class="post-card__action ${liked ? "is-liked" : ""}" data-like="${ui.escapeHtml(post.id)}">
            ${liked ? "已赞" : "点赞"} ${(post.likeIds || []).length}
          </button>
          ${
            me && me.id === post.authorId
              ? `<button type="button" class="post-card__action" data-pin="${ui.escapeHtml(post.id)}">${
                  post.pinned ? "取消置顶" : "置顶"
                }</button>`
              : ""
          }
        </div>
      </article>`;
  }

  global.SHILEMA_MOBILE = {
    renderPostCard,
  };
})(window);
