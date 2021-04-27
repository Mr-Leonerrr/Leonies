const Discord = require("discord.js");
const i18n = require("i18n");
const db = require("megadb");
let prefix_db = new db.crearDB("prefixes");
const { default_prefix } = require("../config.json");
const { LOCALE } = require("../util/LeoncitoUtil");

const cooldowns = new Discord.Collection();

module.exports = async (client, message) => {
  let prefix = prefix_db.has(message.guild.id)
    ? await prefix_db.get(`${message.guild.id}.prefix`)
    : default_prefix;

  if (message.content === `<@!${client.user.id}>`) {
    return message.channel.send(
      new Discord.MessageEmbed()
        .setTitle("Settings for this server")
        .setDescription(
          `Prefix of this server: \`${prefix}\`
          Server Region: \`${message.guild.region}\`
          Server ID: \`${message.guild.id}\`

          Type \`${prefix}help\` for the command list.
          [Support](https://discord.gg/uJguFNpkWU) | [Invite](${client.invite})`
        )
        .setColor("#6A0CED")
        .setFooter(client.ownerInfo)
    );
  }

  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command =
    client.commands.get(commandName) ||
    client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

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
        i18n.__mf("common.cooldownMessage", {
          time: timeLeft.toFixed(1),
          name: command.name,
        })
      );
    }
  }

  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

  try {
    command.callback(message, args, client);
  } catch (error) {
    console.error(error);
    message.reply("There was an error executing the command ⚠!");
  }
};
