require("dotenv/config")
const { Client, IntentsBitField } = require("discord.js");
const { CommandHandler } = require("djs-commander");
const path = require("path");
const mongoose = require("mongoose");

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

new CommandHandler({
  client,
  eventsPath: path.join(__dirname, "events"),
  commandsPath: path.join(__dirname, "commands"),
});

(async () => {
  //Connect to MongoDB
  try {
    await mongoose.connect(process.env.MONGO_DB);
    console.log(`Connected to the Database!`);
  } catch (err) {
    console.error(err);
  }

  // Login to Discord
  client.login(process.env.BOT_TOKEN);
})();
