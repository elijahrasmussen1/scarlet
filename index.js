require('dotenv').config();
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const PREFIX = '-';

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);

  client.user.setPresence({
    activities: [{ name: 'watching you...', type: ActivityType.Custom, state: 'watching you...' }],
  });
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'reply') {
    const messageId = args.shift();
    const replyText = args.join(' ');

    if (!messageId || !replyText) {
      return message.reply('Usage: `-reply <messageId> <message>`');
    }

    // Search all text channels in the server for the message
    const channels = message.guild.channels.cache.filter(
      (ch) => ch.isTextBased() && ch.permissionsFor(message.guild.members.me)?.has('ViewChannel')
    );

    let targetMessage = null;
    for (const [, channel] of channels) {
      try {
        targetMessage = await channel.messages.fetch(messageId);
        if (targetMessage) break;
      } catch {
        // Message not in this channel, continue searching
      }
    }

    if (!targetMessage) {
      return message.reply('Could not find a message with that ID in this server.');
    }

    await targetMessage.reply(replyText);
  }
});

if (!process.env.TOKEN) {
  console.error('ERROR: No bot token provided. Set TOKEN in your .env file.');
  process.exit(1);
}

client.login(process.env.TOKEN);
