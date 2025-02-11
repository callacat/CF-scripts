# Cloudflare Worker 游戏更新检查器

此 Cloudflare Worker 脚本检查指定游戏在 [https://byrutgame.org/lastversion-pcgame/](https://byrutgame.org/lastversion-pcgame/) 上的更新，并在发现更新时发送通知。

## 部署

1.  **创建 Cloudflare Worker：**
    *   登录您的 Cloudflare 帐户。
    *   转到 "Workers & Pages"。
    *   单击 "Create application"。
    *   单击 "Create Worker"。
    *   为您的 Worker 命名（例如，"game-update-checker"）。

2.  **复制代码：**
    *   复制 `game-check.js` 的内容并将其粘贴到 Cloudflare Worker 编辑器中，替换默认代码。

3.  **配置环境变量：**
    *   在 Worker 设置中，转到 "Settings" -> "Variables"。
    *   添加以下环境变量：
        *   `GAME_NAMES`：您要跟踪的游戏名称的逗号分隔列表（例如，"Creeper World IXE, Another Game, Yet Another Game"）。**重要提示：** 使用网站上显示的确切名称。
        *   `NOTIFICATION_TYPE`：要使用的通知方法的逗号分隔列表。支持的值为：`telegram`，`pushplus`。示例：`"telegram,pushplus"` 以同时启用两者。留空以禁用通知。
        *   如果 `NOTIFICATION_TYPE` 包含 `telegram`：
            *   `TELEGRAM_BOT_TOKEN`：您的 Telegram 机器人令牌。
            *   `TELEGRAM_CHAT_ID`：您的 Telegram 聊天 ID。
        *   如果 `NOTIFICATION_TYPE` 包含 `pushplus`：
            *   `PUSHPLUS_TOKEN`：您的 PushPlus 令牌。

4.  **保存并部署：**
    *   单击 "Save and deploy"。

## 获取 API 密钥和令牌

### Telegram

1.  **创建机器人：**
    *   在 Telegram 上与 [BotFather](https://telegram.me/BotFather) 交谈。
    *   发送 `/newbot` 并按照说明创建新机器人。
    *   BotFather 将为您提供一个机器人令牌（例如，`1234567890:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghi`）。这是您的 `TELEGRAM_BOT_TOKEN`。

2.  **获取您的聊天 ID：**
    *   与您的机器人开始对话。
    *   向您的机器人发送消息。
    *   在浏览器中访问 `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`（将 `<YOUR_BOT_TOKEN>` 替换为您的实际机器人令牌）。
    *   在 JSON 响应中查找 `"chat":{"id":` 值。这是您的 `TELEGRAM_CHAT_ID`。它可能是一个负数。

### PushPlus

1.  **创建帐户：**
    *   转到 [http://www.pushplus.plus/](http://www.pushplus.plus/) 并创建一个帐户。

2.  **获取您的令牌：**
    *   登录您的 PushPlus 帐户。
    *   您的令牌将显示在网站上。 这是您的 `PUSHPLUS_TOKEN`。


## 添加更多通知方法

该脚本设计为易于扩展。要添加新的通知方法：

1.  创建一个实现 `NotificationProvider` 接口的新类（您必须直接修改 JavaScript 代码，因为为了兼容性，该接口已被删除）。该类应具有一个 `notify` 方法，该方法将游戏名称和 URL 作为参数。
2.  在 `fetch` 函数中添加一个新的 `else if` 块，以检查新的 `NOTIFICATION_TYPE` 并创建您的新通知提供程序类的实例。

## 调用 Worker

可以通过两种方式调用此 worker：

1.  **HTTP 请求：** 您可以将 HTTP 请求发送到 worker 的 URL。这对于测试或按需检查非常有用。
2.  **Cron 触发器（计划）：** 您可以在 Cloudflare Worker 设置中设置 cron 触发器以计划脚本定期运行。

### 设置 Cron 触发器（可选）：

1.  在 Worker 设置中，转到 "Triggers" -> "Cron"。
2.  添加 Cron 触发器以计划脚本定期运行（例如，`*/5 * * * *` 每 5 分钟运行一次）。


## 示例

假设您要跟踪 "Creeper World IXE" 和 "Another Game" 并通过 Telegram 和 PushPlus 接收通知。您的环境变量将如下所示：

*   `GAME_NAMES`：`Creeper World IXE, Another Game`
*   `NOTIFICATION_TYPE`：`telegram,pushplus`
*   `TELEGRAM_BOT_TOKEN`：`您的 Telegram 机器人令牌`
*   `TELEGRAM_CHAT_ID`：`您的 Telegram 聊天 ID`
*   `PUSHPLUS_TOKEN`：`您的 PushPlus 令牌`

部署后，Worker 将在调用时（通过 HTTP 或 cron 触发器）检查网站，并在找到 "Creeper World IXE" 或 "Another Game" 的更新时通过 Telegram 和 PushPlus 发送通知。
