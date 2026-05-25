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

  client.user.setActivity('you', { type: ActivityType.Watching });
});

client.on('messageCreate', (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  // No commands yet
});

if (!process.env.TOKEN) {
  console.error('ERROR: No bot token provided. Set TOKEN in your .env file.');
  process.exit(1);
}

client.login(process.env.TOKEN);
