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

  client.user.setActivity('watching you...', { type: ActivityType.Custom });
});

client.on('messageCreate', (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'reply') {
    const replyText = args.join(' ');
    if (!replyText) {
      return message.reply('Please provide a message. Usage: `-reply <message>`');
    }
    message.reply(replyText);
  }
});

if (!process.env.TOKEN) {
  console.error('ERROR: No bot token provided. Set TOKEN in your .env file.');
  process.exit(1);
}

client.login(process.env.TOKEN);
