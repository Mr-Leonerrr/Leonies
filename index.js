require("dotenv").config();
const Discord = require("discord.js");
const path = require("path");
const { LOCALE } = require("./util/LeoncitoUtil");
const i18n = require("i18n");

i18n.configure({
  locales: ["en", "es"],
  directory: path.join(__dirname, "locales"),
  defaultLocale: "en",
  objectNotation: true,
  register: global,

  logWarnFn: function (msg) {
    console.log("warn", msg);
  },

  logErrorFn: function (msg) {
    console.log("error", msg);
  },

  missingKeyFn: function (locale, value) {
    return value;
  },

  mustacheConfig: {
    tags: ["{{", "}}"],
    disable: false,
  },
});

const client = new Discord.Client({
  disableEveryone: true,
  autoReconnect: true,
  disableEvents: ["TYPING_START"],
  partials: ["MESSAGE", "CHANNEL", "GUILD_MEMBER", "REACTION"],
});

client.commands = new Discord.Collection();
client.event = new Discord.Collection();
client.aliases = new Discord.Collection();
client.queue = new Map();

const loadCommands = require("./functions/commands");
const loadEvents = require("./functions/events");

const load = async () => {
  await loadCommands.run(client);
  await loadEvents.run(client);
};

load();

client.login(process.env.TOKEN);
