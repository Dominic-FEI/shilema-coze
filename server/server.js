/**
 * 可选第二阶段：本地 API 转发扣子对话，PAT 不进前端。
 * 静态页复用 ../web
 */
require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const { CozeAPI, COZE_CN_BASE_URL, ChatEventType, RoleType } = require("@coze/api");

const app = express();
const port = process.env.PORT || 3000;
const webRoot = path.join(__dirname, "..", "web");

app.use(cors());
app.use(express.json());
app.use(express.static(webRoot));

const token = process.env.COZE_PAT;
const botId = process.env.COZE_BOT_ID;

const client =
  token &&
  new CozeAPI({
    token,
    baseURL: COZE_CN_BASE_URL,
  });

app.post("/api/chat", async (req, res) => {
  try {
    if (!client || !botId) {
      return res.status(500).json({ ok: false, msg: "未配置 COZE_PAT / COZE_BOT_ID" });
    }
    const { message, userId = "local_user" } = req.body || {};
    if (!message) return res.status(400).json({ ok: false, msg: "message 必填" });

    const stream = await client.chat.stream({
      bot_id: botId,
      user_id: String(userId),
      additional_messages: [
        { role: RoleType.User, content: message, content_type: "text" },
      ],
    });

    let answer = "";
    for await (const part of stream) {
      if (part.event === ChatEventType.CONVERSATION_MESSAGE_DELTA) {
        answer += part.data.content || "";
      }
    }
    res.json({ ok: true, answer });
  } catch (e) {
    res.status(500).json({ ok: false, msg: e.message || "调用失败" });
  }
});

app.listen(port, () => {
  console.log("拾了么本地服务: http://localhost:" + port);
  console.log("静态目录: " + webRoot);
});
