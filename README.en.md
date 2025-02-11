# Cloudflare Worker Game Update Checker

This Cloudflare Worker script checks for updates to specified games on [https://byrutgame.org/lastversion-pcgame/](https://byrutgame.org/lastversion-pcgame/) and sends notifications when updates are found.

## Deployment

1.  **Create a Cloudflare Worker:**
    *   Log in to your Cloudflare account.
    *   Go to "Workers & Pages".
    *   Click "Create application".
    *   Click "Create Worker".
    *   Give your worker a name (e.g., "game-update-checker").

2.  **Copy the Script:**
    *   Copy the contents of `game-check.js` and paste it into the Cloudflare Worker editor, replacing the default code.

3.  **Configure Environment Variables:**
    *   In the Worker settings, go to "Settings" -> "Variables".
    *   Add the following environment variables:
        *   `GAME_NAMES`: A comma-separated list of the names of the games you want to track (e.g., "Creeper World IXE, Another Game, Yet Another Game"). **Important:** Use the exact names as they appear on the website.
        *   `NOTIFICATION_TYPE`: A comma-separated list of notification methods to use. Supported values are: `telegram`, `pushplus`.  Example: `"telegram,pushplus"` to enable both. Leave empty to disable notifications.
        *   If `NOTIFICATION_TYPE` includes `telegram`:
            *   `TELEGRAM_BOT_TOKEN`: Your Telegram bot token.
            *   `TELEGRAM_CHAT_ID`: Your Telegram chat ID.
        *   If `NOTIFICATION_TYPE` includes `pushplus`:
            *   `PUSHPLUS_TOKEN`: Your PushPlus token.

4.  **Save and Deploy:**
    *   Click "Save and deploy".


## Obtaining API Keys and Tokens

### Telegram

1.  **Create a Bot:**
    *   Talk to [BotFather](https://telegram.me/BotFather) on Telegram.
    *   Send `/newbot` and follow the instructions to create a new bot.
    *   BotFather will give you a bot token (e.g., `1234567890:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghi`). This is your `TELEGRAM_BOT_TOKEN`.

2.  **Get Your Chat ID:**
    *   Start a conversation with your bot.
    *   Send a message to your bot.
    *   Visit `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates` in your browser (replace `<YOUR_BOT_TOKEN>` with your actual bot token).
    *   Look for the `"chat":{"id":` value in the JSON response. This is your `TELEGRAM_CHAT_ID`. It may be a negative number.

### PushPlus

1.  **Create an Account:**
    *   Go to [http://www.pushplus.plus/](http://www.pushplus.plus/) and create an account.

2.  **Get Your Token:**
    *   Log in to your PushPlus account.
    *   Your token will be displayed on the website. This is your `PUSHPLUS_TOKEN`.


## Adding More Notification Methods

The script is designed to be easily extensible. To add a new notification method:

1.  Create a new class that implements the `NotificationProvider` interface (you would have to modify the JavaScript code directly, as the interface was removed for compatibility). The class should have a `notify` method that takes the game name and URL as arguments.
2.  Add a new `else if` block in the `fetch` function to check for the new `NOTIFICATION_TYPE` and create an instance of your new notification provider class.

## Invoking the Worker

This worker can be invoked in two ways:

1.  **HTTP Requests:** You can send HTTP requests to the worker's URL. This is useful for testing or on-demand checks.
2.  **Cron Triggers (Scheduled):** You can set up a cron trigger in the Cloudflare Worker settings to run the script periodically.

### Setting up a Cron Trigger (Optional):

1.  In the Worker settings, go to "Triggers" -> "Cron".
2.  Add a cron trigger to schedule the script to run periodically (e.g., `*/5 * * * *` to run every 5 minutes).


## Example

Let's say you want to track "Creeper World IXE" and "Another Game" and receive notifications via Telegram and PushPlus. Your environment variables would look like this:

*   `GAME_NAMES`: `Creeper World IXE, Another Game`
*   `NOTIFICATION_TYPE`: `telegram,pushplus`
*   `TELEGRAM_BOT_TOKEN`: `your_telegram_bot_token`
*   `TELEGRAM_CHAT_ID`: `your_telegram_chat_id`
*   `PUSHPLUS_TOKEN`: `your_pushplus_token`

Once deployed, the worker will check the website when invoked (either via HTTP or cron trigger) and send notifications via Telegram and PushPlus if updates for "Creeper World IXE" or "Another Game" are found.
