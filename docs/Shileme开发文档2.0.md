# Shileme（拾了么）开发文档 2.0

> 整理自项目对话与迭代全过程：从扣子 B 方案脚手架，到多页业务、西外身份融入、设计规范与本地演示。  
> 对应仓库目录：`shilema-coze/`  
> 文档日期：2026-10-14  
> 设计规范版本：v1.6.1

---

## 1. 项目一句话

「拾了么」是面向 **西安外国语大学（XISU）** 的校园互助 Web：  
**失物招领** + **闲置互换（线下看成色）** + **学号个人主页** + **扣子（Coze）AI 助手**。

---

## 2. 对话与需求演进（摘要）

| 阶段 | 用户诉求 | 结果 |
|------|----------|------|
| 1 | 按扣子 B 方案建项目 + 全局规范（非 AI 蓝紫） | 脚手架、`DESIGN_SYSTEM`、演示页 + Chat SDK |
| 2 | 询问下一步 / 找 BOT_ID | 引导编排页取 ID；写入 `7695671761278500907` |
| 3 | 代填 PAT、启动本地服务 | 配置 `config.js`，`serve :5173` |
| 4 | 要闲置交易、双主页、个人主页；失物联系改手机号或学号姓名 | 多页：`index/lost/trade/profile` + localStorage |
| 5 | XISU 校徽元素、日夜主题、顶栏头像、账号切换/注销、学院字段、图片上传 | v1.2 功能 |
| 6 | 校徽过硬冲突；顶栏艺术校名；借鉴高校站；写 2.0 总文档 | 视觉融合 v1.3 |
| 7 | 信息流可视化、关键字搜索、「+」发帖入口 | **规范 v1.4 + lost/trade 改版** |
| 8 | 登录/注册与发帖加入法定免责与责任协议，必勾确认 | **规范 v1.5 + `.legal-consent` + `legal.js`** |
| 9 | 移动端 H5 社区 Feed、评论 10s 声明、私信（图/文件/表情） | **规范 v1.6 + feed/post/messages/chat** |

---

## 3. 关键文档索引

| 文档 | 路径 | 作用 |
|------|------|------|
| 全局设计规范 | `docs/DESIGN_SYSTEM.md` | 颜色/字体/组件/业务规则唯一权威 |
| 本汇总 | `docs/Shileme开发文档2.0.md` | 需求演进、改版步骤、结构与验收 |
| 配置示例 | `web/js/config.example.js` | 复制为 `config.js` 填 BOT/PAT |
| 仓库说明 | `README.md` | 启动与目录 |
| 知识库原文 | `knowledge/*.md` | 上传扣子知识库 |

实现必须遵守：`DESIGN_SYSTEM.md` → `web/css/tokens.css` → 共用组件 → 页面。

---

## 4. 修改步骤总览（按时间）

### 4.1 初始化（脚手架）

1. 创建 `shilema-coze/{docs,web,knowledge,server}`  
2. 撰写设计规范 v1.0（原墨松绿方案）与 Token/组件 CSS  
3. 静态演示页 + `config.js` / `chat.js`  
4. 知识库原文 FAQ + 失物样本  
5. 可选 Node `server/`  

### 4.2 扣子联调

1. 取得 `BOT_ID`（编排 URL `/bot/` 后，或发布安装代码）  
2. 取得 PAT，写入 `web/js/config.js`（勿公开提交）  
3. 发布 Chat SDK；本地 `npx serve -l 5173`  

### 4.3 多页业务（v1.1）

1. `storage.js` 本地状态；`auth.js` 学号账号  
2. `shell.js` 共用顶栏  
3. 页面：首页双入口、失物、闲置、个人主页  
4. 失物联系：手机号 **或** 学号+姓名  
5. 闲置：申请互换联系方式 → 线下看成色  

### 4.4 西外与增强（v1.2）

1. 主色改为校徽藏蓝；日/夜 `data-theme`  
2. 顶栏头像、主题切换、切换账号/注销  
3. 联系方式增加 **学院**；失物/闲置 **配图**  
4. 数据键升级 `shilema_v3`  

### 4.5 视觉融合改版（v1.3 · 本次）

**问题：** 实心校色条 + 多处大校徽贴图，与产品页冲突、显生硬。  

**借鉴：**

- 高校顶栏留白与「校徽小而清晰」（参考 [St Andrews Header](https://www.st-andrews.ac.uk/dpl/1.27.0/patterns/header/index.html)、Notre Dame 顶栏规范思路）  
- 校徽释义与蓝色气质（忠诚/理性）：[西外标识说明相关介绍](https://www.3wen.com/wenzhang/id/14742.html)、[xisu.edu.cn 学校标识](https://www.xisu.edu.cn/xxgk1/xxbs.htm)  
- 校园 Lost&Found 类项目以功能页为主、校标作身份点缀（如 GitHub 上 FoundIt / Lost-Found 等，避免整页刷校色）  

**改法：**

1. 去掉高饱和 `.xisu-bar`  
2. 新增 `.campus-masthead`：最顶部艺术字体「西安外国语大学」（`--font-art` / Ma Shan Zheng）+ 英文副行 + 小校徽  
3. 产品 sticky 栏仅弱化小校徽；内容区用文字眉题 `.xisu-mark`，不再重复贴徽  
4. Hero 用抽象校门线 CSS，隐藏实图校徽叠层  
5. 更新 `DESIGN_SYSTEM` → v1.3  

---

## 5. 当前信息架构

```
校园艺术校名条（campus-masthead）
        ↓
产品顶栏（拾了么 · 导航 · 日夜 · 账号）
        ↓
首页 ──┬── 校园社区 H5（单列 Feed · 置顶 · 赞/评/阅读 · 详情评论 10s 声明）
       ├── 失物招领（信息流 · 关键字搜索 ·「+」发帖登记/配图）
       ├── 闲置交易（信息流 · 关键字搜索 ·「+」发布 · 互换联系）
       └── 私信（列表 · 聊天：文字/照片/文件/Twemoji）
个人主页（学号注册登录 · 资料 · 切换/注销）
产品顶栏统一导航（无独立五栏条）
扣子 Chat SDK（全站可唤起）
```

---

## 6. 目录结构（现行）

```
shilema-coze/
├── docs/
│   ├── DESIGN_SYSTEM.md
│   └── Shileme开发文档2.0.md    ← 本文件
├── knowledge/
│   ├── 校园失物招领FAQ.md
│   └── 演示失物样本.md
├── web/
│   ├── index.html / feed.html / post.html / messages.html / chat.html
│   ├── lost.html / trade.html / profile.html
│   ├── assets/xisu-crest.png
│   ├── css/tokens.css · base.css · components.css
│   └── js/
│       ├── theme.js · storage.js · auth.js · legal.js · community.js
│       ├── emoji.js · shell.js · mobile-shell.js
│       ├── config.example.js · chat.js
│       └── pages/{feed,post,messages,chat-dm,lost,trade,profile}.js
├── server/          # 可选 API
├── .env.example
├── .gitignore
└── README.md
```

---

## 7. 共用组件清单（实现层）

| 类名 | 文件 | 说明 |
|------|------|------|
| `.campus-masthead` | components.css + shell.js | 艺术校名顶条 |
| `.site-header` | 同上 | 产品导航 |
| `.theme-toggle` | theme.js + shell | 日夜切换 |
| `.account-menu` | shell.js | 头像菜单 |
| `.gate` | components | 双入口 |
| `.seg` `.field` `.item-row` | components | 筛选/表单/列表 |
| `.media-thumb` | components | 配图 |
| `.modal` | trade.html | 互换确认 |
| `.xisu-mark` | components | 无图眉题 |
| `.legal-consent` | components + `legal.js` | 法定告知滚动区 + 必勾确认 |
| `.legal-wait` | legal.js | 评论前 10s 强制阅读闸门 |
| `.post-card` `.feed-stream` | mobile-shell + components | 社区帖卡 / 单列流 |
| `.dm-row` `.chat-bubble` `.emoji-panel` | components | 私信列表 / 气泡 / 表情 |

JS 命名空间：`SHILEMA_STORE` / `SHILEMA_AUTH` / `SHILEMA_LEGAL` / `SHILEMA_COMMUNITY` / `SHILEMA_EMOJI` / `SHILEMA_MOBILE` / `SHILEMA_UI` / `SHILEMA_THEME` / `SHILEMA_CHAT`。

---

## 8. 业务规则（现行）

### 失物招领 / 闲置交易（信息流主页 · v1.4）

- 进入后先浏览**他人发布**帖子，按**发布时间倒序**  
- **关键字搜索**（标题、地点、特征、类别、发布者等）  
- 顶部「**+**」展开登记/发布面板（含配图上传）；默认收起  
- 失物联系：手机号，或学号 + 姓名 + 学院  
- 闲置：联系默认隐藏 → 申请互换 → 线下看成色  

交互参考校园 Lost&Found 常见模式（信息流 + 搜索 + FAB 发帖）。

### 账号

- 学号注册/登录；资料含头像、昵称、性别、学院、手机号  
- 换头像后顶栏立即刷新  
- 支持切换账号、注销  
- **登录 / 注册表单下方**须勾选《账号与平台服务协议》（未勾选不可提交）  

### 法定告知（v1.5）

| 场景 | 协议 | 侧重点 |
|------|------|--------|
| 登录、注册 | `account`《账号与平台服务协议》 | 账号真实、个保法告知、平台信息中介免责 |
| 失物/闲置发帖 | `publish`《发布与交易责任声明》 | 内容真实、遗失物义务、买卖双方、线下风险自担 |

- 共用组件：`.legal-consent`；挂载 `data-legal-mount`；逻辑 `web/js/legal.js`  
- 默认未勾选；提交前 `assertAccepted`；发帖成功后 `reset` 需再次勾选  
- 同意日志：`localStorage.shilema_legal_log`（演示存证）  
- 文案参考《民法典》《个保法》原则及 CampusClaim / ReclaimX 等校园 ToS；非正式法律意见  

---

## 9. 本地启动与演示账号

```bash
cd shilema-coze/web
npx --yes serve -l 5173
```

打开 http://localhost:5173  

| 角色 | 学号 | 密码 |
|------|------|------|
| 卖方 | 2021001001 | 123456 |
| 买方 | 2021002002 | 123456 |

扣子：`web/js/config.js` 中配置 `botId` / `pat`；智能体需已发布 Chat SDK。  
知识库更新后请重新上传 `knowledge/` 至扣子。

**安全：** PAT 勿推公开仓库；曾在对话中出现过的令牌建议在扣子侧轮换。

---

## 10. 设计 Token 摘要（v1.6）

- 日间主色：`#1A3668`；强调：`#B86A1C`  
- 夜间通过 `[data-theme="dark"]` 覆盖  
- 艺术字体：`--font-art: "Ma Shan Zheng", …`（仅校名条）  
- 圆角：4 / 8 / 12 / 16；「+」为方形 `radius-md`，非胶囊  
- 失物/闲置流：`.feed-head` `.search-bar` `.fab-plus` `.composer`  
- 法定告知：`--color-legal-*` · `.legal-consent` · `.legal-wait`  
- **社区 Feed**：`--color-feed-*` · `.post-card` · `.m-topbar`  
- **私信**：`--color-chat-*` · `.chat-bubble` · `.emoji-panel`（Twemoji CC-BY 4.0）  

完整表见 `DESIGN_SYSTEM.md` 与 `tokens.css`。

---

## 11. 建议后续（非本次范围）

1. 将 PAT 迁到 `server/` 环境变量，前端只走本地 API  
2. 扣子人设同步「学院字段 + 闲置互换话术」  
3. 真实图片对象存储（替代 localStorage DataURL）  
4. 答辩 PPT / 演示视频（按赛事要求自备）  
5. 互换联系弹层可增补精简二次确认（已有当面看货提示）  

---

## 12. 建议自测路径

1. http://localhost:5173/feed.html → 浏览单列 Feed；置顶帖在最上  
2. 登录后点赞 / 作者置顶；点进详情看阅读量增加  
3. 发表评论：须等满 10 秒并勾选言论声明  
4. 私信：新对话 → 发文字 / 表情 / 照片 / 文件  
5. 产品顶栏切换社区·失物·闲置·私信；日夜与账号菜单可用  
6. 登录/发帖协议勾选回归；日夜主题对比度  

---

## 13. 验收对照

- [x] 全局规范文档存在且页面按 Token 实现  
- [x] 共用组件抽出（含 post-card / legal-wait / emoji-panel）  
- [x] 双主功能页 + 个人主页 + AI 入口  
- [x] 移动校园社区 Feed（置顶 + 时间序 + 赞评阅读）  
- [x] 评论 10s 责任声明闸门  
- [x] 私信：照片 / 文件 / 免费表情  
- [x] 闲置互换联系 + 线下看成色说明  
- [x] 失物联系含学院；配图上传  
- [x] 日夜主题入口  
- [x] 顶栏头像与账号切换/注销  
- [x] 登录/注册必勾账号协议；发帖必勾发布责任声明  
- [x] `Shileme开发文档2.0.md` 已归档  
- [x] `config.js` 已 gitignore + example  
- [ ] **扣子侧**：人设改为手机号或学号+姓名+学院；重传知识库；确认 Chat SDK 已发布  

## 14. 迭代进度记录

| 时间 | 事项 | 状态 |
|------|------|------|
| 2026-10-14 | v1.5 法定告知组件与双协议 | 完成 |
| 2026-10-14 | v1.6 community 数据层 + Feed/详情/私信页 | 完成 |
| 2026-10-14 | `.post-card` / `.legal-wait` / Twemoji 表情 | 完成 |
| 2026-10-14 | DESIGN_SYSTEM / 开发文档 / README 升至 v1.6 | 完成 |
| 2026-10-14 | 去除五栏顶/底条，导航统一走 `site-header` | 完成 |
| 2026-10-14 | **v1.6.1** 修复登录：空用户修复、协议提示、存储容错、页脚版本号 | 完成 |

## 15. 扣子云端待办

本地 Web 已闭环。请在 [coze.cn](https://www.coze.cn) 完成：

1. 人设删除「学号后四位」，改为与本站一致的联系方式规则  
2. 重新上传 `knowledge/校园失物招领FAQ.md`  
3. 若 PAT 曾在聊天中出现，建议轮换并只保存在本地 `config.js`  

---

*文档结束 · Shileme 开发文档 2.0*
