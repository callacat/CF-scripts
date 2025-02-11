// Telegram notification provider
class TelegramNotificationProvider {
  constructor(botToken, chatId) {
    this.botToken = botToken;
    this.chatId = chatId;
  }

  async notify(gameName, gameUrl) {
    const message = `Game update found!\n\nName: ${gameName}\nURL: ${gameUrl}`;
    const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: this.chatId,
        text: message,
      }),
    });

    if (!response.ok) {
      throw new Error(`Telegram notification failed: ${response.status} - ${await response.text()}`);
    }
  }
}

// PushPlus notification provider
class PushPlusNotificationProvider {
    constructor(token) {
        this.token = token;
    }
    async notify(gameName, gameUrl) {
        const message = `Game update found!\n\nName: ${gameName}\nURL: ${gameUrl}`;
        const url = `http://www.pushplus.plus/send`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: this.token,
                title: 'Game Update',
                content: message,
                template: 'txt'
            }),
        });

        if (!response.ok) {
            throw new Error(`PushPlus notification failed: ${response.status} - ${await response.text()}`);
        }
    }
}

// Main worker logic
export default {
  async fetch(request, env, ctx) {
    try {
      const gameNames = (env.GAME_NAMES || '').split(',').map((name) => name.trim()).filter((name) => name !== '');
      const notificationType = env.NOTIFICATION_TYPE; // 'telegram' or 'pushplus'

      if (!gameNames.length) {
        return new Response('GAME_NAMES environment variable not set or empty', { status: 500 });
      }
      if (!notificationType) {
        return new Response('NOTIFICATION_TYPE environment variable not set', { status: 500 });
      }

      const websiteUrl = 'https://byrutgame.org/lastversion-pcgame/';
      const response = await fetch(websiteUrl);

      if (!response.ok) {
        return new Response(`Failed to fetch website: ${response.status}`, { status: 500 });
      }

      const html = await response.text();
      const foundGames = [];

      for (const gameName of gameNames) {
          // Use a more robust regex to find the game.  This regex accounts for variations in attributes and spacing.
          const gameRegex = new RegExp(`<a href="([^"]*)" class="short_upd">\\s*<div class="shortupd_imgs">\\s*<img[^>]*alt="${gameName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>\\s*</div>\\s*<div class="shortupd_body">\\s*<span class="name">${gameName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');

          const match = gameRegex.exec(html);
          if (match) {
            const gameUrl = new URL(match[1], websiteUrl).href; // Construct absolute URL
            foundGames.push({ name: gameName, url: gameUrl });
          }
      }

      if (foundGames.length) {
        let message = 'Game update(s) found!\n\n';
        for (const game of foundGames) {
            message += `Name: ${game.name}\nURL: ${game.url}\n\n`;
        }

        const notificationTypes = (env.NOTIFICATION_TYPE || '').split(',').map(type => type.trim()).filter(type => type !== '');

        if (notificationTypes.length === 0) {
            return new Response('No notification types configured', { status: 200 }); // Or 204 No Content
        }

        for (const notificationType of notificationTypes) {
            try {
                let provider;
                if (notificationType === 'telegram') {
                    const botToken = env.TELEGRAM_BOT_TOKEN;
                    const chatId = env.TELEGRAM_CHAT_ID;
                    if (!botToken || !chatId) {
                        console.log('Telegram notification skipped: TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID not set');
                        continue;
                    }
                    provider = new TelegramNotificationProvider(botToken, chatId);
                } else if (notificationType === 'pushplus') {
                    const token = env.PUSHPLUS_TOKEN;
                    if (!token) {
                        console.log('PushPlus notification skipped: PUSHPLUS_TOKEN not set');
                        continue;
                    }
                    provider = new PushPlusNotificationProvider(token);
                } else {
                    console.log(`Unsupported notification type: ${notificationType}`);
                    continue; // Skip unsupported types
                }
                await provider.notify("Multiple Games", message); //Using a placeholder name
            } catch (error) {
                console.error(`Error sending ${notificationType} notification:`, error);
            }
        }

        return new Response(`Notification(s) sent for ${foundGames.length} game(s)`);
      }

      return new Response(`No updates found for the specified games`);

    } catch (error) {
      return new Response(`Error: ${error.message}`, { status: 500 });
    }
  },
};
