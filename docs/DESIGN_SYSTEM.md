# 拾了么 · 全局设计规范（Design System）

> 所有本地页、组件、后续迭代 **必须** 遵循本文档。  
> 实现以 `web/css/tokens.css` 为唯一视觉数据源；改视觉先改 Token，再改组件。

文档版本：v1.6.1  
适用项目：`shilema-coze`（西外校园失物招领 + 闲置互换 + **移动社区 Feed** + 私信 + 个人主页 + 扣子助手）  
品牌名：拾了么

---

## 1. 设计定位

| 项 | 约定 |
|----|------|
| 校园身份 | 西安外国语大学（XISU，1952）；校徽 `web/assets/xisu-crest.png`（透明底） |
| 产品气质 | 校务可信、布告栏清晰；**院校元素克制融入，不抢产品主视觉** |
| 信息架构 | 首页 → **校园社区 Feed（H5）** / 失物 / 闲置 / 私信 / 个人主页 |
| Feed 规则 | **单列卡片**垂直滚动；**置顶优先**，其余按**发布日倒序** |
| 法定告知 | 登录/注册/发帖须勾选；**评论须阅读满 10 秒**责任声明 |
| 禁止方向 | AI 蓝紫渐变、霓虹 glow、整条高饱和校色色带、页面多处重复贴大校徽 |

**主题：西外藏蓝 × 暖琥珀 × 雾灰纸色（日）/ 深靛夜色（夜）**

移动社区参考：Campus Wall / CampusWire 式单列 Feed + 帖卡互动；表情用 **Unicode + Twemoji（CC-BY 4.0）**，避免侵权素材。

---

## 2. 校园身份融入规则（v1.3 重点）

### 2.1 唯一正式校名区：`.campus-masthead`

- 位于**页面最顶上方**（产品 sticky 导航之上）  
- 中文校名使用艺术字体 `--font-art`（Ma Shan Zheng，呼应校徽毛体气质）  
- 英文一行小号大写字距：`Xi'an International Studies University · XISU · 1952`  
- 校徽小尺寸（约 36px）、低饱和，**居中陪衬，不作主焦点**  
- 背景用 elevated→surface 轻渐变 + 细底边，**禁止实心高饱和色条**

### 2.2 产品顶栏

- 主品牌「拾了么」为导航焦点  
- 导航含：首页 · **社区** · 失物 · 闲置 · **私信** · AI  
- 校徽仅 28px 弱化点缀；主题切换、账号菜单保持右侧  

### 2.3 导航约定

- **统一使用产品顶栏** `.site-header`（含社区 / 失物 / 闲置 / 私信）  
- **不使用**独立五栏顶/底条（已移除 `.m-tabs`），避免与产品导航重复  

### 2.4 内容区与页脚

- 可用 `.xisu-mark` 短眉题；首页可用 `.campus-scape`  
- 页脚轻署名：「拾了么 · 服务西外师生 · …」

---

## 3. 颜色与主题模式

日间 / 夜间 Token 见 `web/css/tokens.css`。  
主色 `--color-brand: #1A3668`；强调 `--color-accent: #B86A1C`。  

**法定告知 Token（v1.5）：** `--color-legal-*`  

**移动 Feed / 聊天 Token（v1.6）：**

| Token | 用途 |
|-------|------|
| `--color-feed-card` | 帖卡表面 |
| `--color-feed-meta` | 时间、阅读量等次级信息 |
| `--color-feed-action` | 评论等操作字色 |
| `--color-feed-like` | 已赞（琥珀） |
| `--color-feed-pin` | 置顶标识 |
| `--color-chat-mine` / `--color-chat-peer` | 气泡双方 |

禁止写死 `#fff` 作按钮字：用 `--color-on-brand` / `--color-on-accent`。

---

## 4. 文字

| Token | 用途 |
|-------|------|
| `--font-art` | 仅校园顶栏中文校名 |
| `--font-display` | 品牌、协议标题、移动顶栏标题 |
| `--font-sans` | 正文、帖文、评论、聊天气泡 |

帖卡层次：用户名（semibold）→ 时间（caption/meta）→ 正文（body）→ 底栏数据（caption）。

---

## 5. 共用组件

| 组件 | 类名 | 说明 |
|------|------|------|
| 艺术校名条 | `.campus-masthead` | 全站顶部唯一院校主标识 |
| 产品顶栏 | `.site-header` | sticky 导航 |
| 帖卡渲染 | `SHILEMA_MOBILE.renderPostCard` | 社区 Feed / 详情共用 |
| 帖子卡片 | `.post-card` | 头像+名+时间+正文+阅读/评/赞/置顶 |
| 信息流容器 | `.feed-stream` | 单列垂直列表 |
| 评论项 | `.comment-item` | 详情评论区 |
| 强制阅读闸 | `.legal-wait` | 评论前 10s；`openWaitGate` |
| 私信列表行 | `.dm-row` | 会话预览 |
| 聊天气泡 | `.chat-bubble` | mine / peer |
| 表情面板 | `.emoji-panel` | Twemoji/Unicode；`SHILEMA_EMOJI` |
| 法定告知勾选 | `.legal-consent` | account / publish / comment |
| 其他 | `.feed-head` `.composer` `.gate` 等 | 见既有约定 |

### 5.1 Feed 与评论（v1.6）

- 列表：`SHILEMA_COMMUNITY.sortedPosts()` — 置顶优先，再按 `createdAt` 倒序  
- 仅作者可置顶/取消置顶  
- 点开帖子：`bumpView`；详情可评论  
- 评论：`openWaitGate("comment", 10)` → 倒计时结束才能勾选确认 → 发表  

### 5.2 私信

- 会话列表 `messages.html`；聊天 `chat.html?thread=`  
- 支持：文字、照片、文件（演示 DataURL）、表情（免费 Twemoji CDN）  

### 5.3 `.legal-consent`（含 comment）

- `account` / `publish` / `comment` 三套文案侧重点不同  
- 评论另走 10 秒闸门，不只勾选  

---

## 6. 业务规则（摘要）

- 社区 Feed：发帖须登录 + 发布责任声明  
- 失物/闲置：信息流 + 搜索 +「+」发帖（既有规则）  
- 登录/注册：账号协议必勾  
- 评论：10s 言论与网络安全声明  
- 学号账号；换头像后顶栏更新  

---

## 7. 变更流程

1. 改本规范 + `tokens.css`  
2. 改共用组件  
3. 同步更新 `docs/Shileme开发文档2.0.md`  

未走 Token 的魔法数字视为违规。
