require('dotenv').config();
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const OpenAI = require('openai');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are a Discord bot with an extremely nonchalant, unbothered personality. You respond like you're the final boss of not caring. You're chill, laid-back, and give off "I just woke up and nothing phases me" energy. Keep responses short and casual. Use lowercase mostly. Don't use exclamation marks often. Act like everything is whatever to you.`;

const PREFIX = '-';

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);

  client.user.setPresence({
    activities: [{ name: 'watching you...', type: ActivityType.Custom, state: 'watching you...' }],
  });
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Handle bot mentions for OpenAI chat
  if (message.mentions.has(client.user)) {
    const prompt = message.content.replace(`<@${client.user.id}>`, '').trim();
    if (!prompt) return;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        max_tokens: 256,
      });

      const reply = response.choices[0].message.content;
      await message.reply(reply);
    } catch {
      await message.reply('eh something broke. try again later or whatever');
    }
    return;
  }

  // Handle prefix commands
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

    try {
      await targetMessage.reply(replyText);
    } catch {
      return message.reply('I don\'t have permission to reply in that channel.');
    }
  }
});

if (!process.env.TOKEN) {
  console.error('ERROR: No bot token provided. Set TOKEN in your .env file.');
  process.exit(1);
}

client.login(process.env.TOKEN);
