const fs = require("fs");
const db = require("megadb");
let prefix_db = new db.crearDB("prefixes");
const Discord = require("discord.js");
const { default_prefix } = require("./config.json");

const client = new Discord.Client({ autoReconnect: true });
client.commands = new Discord.Collection();

const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

const cooldowns = new Discord.Collection();

const queue = new Map();

client.on("ready", () => {
  const activities = [
    `${default_prefix}help`,
    `${client.guilds.cache.size} Servers`,
  ];

  setInterval(() => {
    const index = Math.floor(Math.random() * activities.length);
    client.user.setActivity(activities[index], { type: "LISTENING" });
  }, 10000);

  console.log("I am online!");
});

client.on("message", async (message) => {
  let prefix = prefix_db.has(message.guild.id)
    ? await prefix_db.get(`${message.guild.id}.prefix`)
    : default_prefix;

  client.invite = await client
    .generateInvite({
      permissions: [
        "CREATE_INSTANT_INVITE",
        "SEND_MESSAGES",
        "MANAGE_MESSAGES",
        "EMBED_LINKS",
        "ATTACH_FILES",
        "READ_MESSAGE_HISTORY",
        "ADD_REACTIONS",
        "USE_EXTERNAL_EMOJIS",
        "CONNECT",
        "SPEAK",
      ],
    })
    .then((link) => {
      return link;
    })
    .catch(console.error);

  client.ownerInfo = await client
    .fetchApplication()
    .then((application) => {
      return `Developed by ${application.owner.tag}`;
    })
    .catch(console.error);

  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command =
    client.commands.get(commandName) ||
    client.commands.find(
      (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
    );

  if (!command) return;

  if (command.guildOnly && message.channel.type === "dm") {
    return message.reply("Can't run this command on private messages!");
  }

  if (command.args && !args.length) {
    let reply = `You have not entered any arguments, ${message.author}!`;

    if (command.usage) {
      reply += `\nThe proper use is: \`${prefix}${command.name} ${command.usage}\``;
    }

    return message.channel.send(reply);
  }

  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Discord.Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 3) * 1000;

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.reply(
        `Please wait ${timeLeft.toFixed(
          1
        )} more second(s) before reuse the command \`${command.name}\`.`
      );
    }
  }

  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

  try {
    command.execute(client, message, args, queue);
  } catch (error) {
    console.error(error);
    message.reply("There was an error executing the command ⚠!");
  }
});

client.login(process.env.TOKEN);
