# 拾了么 · 校园失物招领与闲置互换

基于火山引擎扣子（Coze）的校园互助本地项目：  
**失物招领** + **闲置交易（联系方式互换 · 线下看货）** + **学号个人主页** + **AI 助手**。

## 页面

| 页面 | 说明 |
|------|------|
| `web/index.html` | 首页入口（社区 / 失物 / 闲置） |
| `web/feed.html` | **移动社区 Feed**：单列帖卡 · 置顶 · 赞/评/阅读 |
| `web/post.html` | 帖子详情 + 评论区（评论前 **10s** 责任声明） |
| `web/messages.html` / `chat.html` | 私信列表 / 聊天（文字·照片·文件·免费表情） |
| `web/lost.html` | 失物招领：信息流 + 搜索 +「+」登记 |
| `web/trade.html` | 闲置交易：信息流 + 搜索 +「+」发布 / 互换联系 |
| `web/profile.html` | 个人主页：学号注册/登录（必勾账号协议） |

## 设计规范

主题：**西外藏蓝 × 暖琥珀**（日/夜切换；禁止 AI 蓝紫刷屏）。  
完整约定见 [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md)（**v1.6.1**）。  
页脚显示当前版本号（`web/js/version.js`）。  
改样式先改 `web/css/tokens.css`，再改组件。  
协议：`.legal-consent`；评论闸门：`.legal-wait`（10s）；帖卡：`.post-card`；表情：Twemoji CC-BY 4.0。  

开发总说明：[`docs/Shileme开发文档2.0.md`](docs/Shileme开发文档2.0.md)

## 快速启动

```bash
cd web
npx --yes serve -l 5173
```

打开 http://localhost:5173

演示账号（密码均为 `123456`）：

- 卖方 `2021001001`
- 买方 `2021002002`

## 目录

```
shilema-coze/
├── docs/           DESIGN_SYSTEM · Shileme开发文档2.0
├── knowledge/      上传扣子知识库的原文
├── web/            多页前端 + Chat SDK
└── server/         可选 Node API（第二阶段）
```

## 扣子配置

```bash
copy web\js\config.example.js web\js\config.js
```

编辑 `web/js/config.js` 中的 `botId` / `pat`（该文件已在 `.gitignore`）。  
知识库更新后请重新上传 `knowledge/` 到扣子。  
并在扣子人设中改为：联系方式为手机号，或完整学号+姓名+学院（勿再用「学号后四位」）。

## 安全

勿将含真实 PAT 的 `config.js` 推到公开仓库；对话中若曾泄露令牌请在扣子轮换。
