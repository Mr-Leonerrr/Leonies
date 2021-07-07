const { Client, Message, MessageEmbed: Embed, Collection } = require("discord.js");
const db = require("megadb");
let prefix_db = new db.crearDB("prefixes");

/**
 * @param {Client} client
 * @param {Message} message
 */
module.exports = async (client, message) => {
  if (message.author.bot) return;

  const { guild, channel, content, author } = message;

  let prefix = prefix_db.has(guild.id)
    ? await prefix_db.get(`${guild.id}.prefix`)
    : client.config.prefix;

  if (content.trim() === `<@!${client.user.id}>` || content.trim() === `<@${client.user.id}>`) {
    if (content.includes("@here") || content.includes("@everyone")) return;
    return channel.send(
      new Embed()
        .setTitle("Settings for this server")
        .setDescription(
          `Prefix of this server: \`${prefix}\` \nServer Region: \`${guild.region}\` \nServer ID: \`${guild.id}\` \nType \`${prefix}help\` for the command list. \n[Vote](url-for-vote) | [Support](${client.config.support.invite}) | [Invite](${client.invite})`
        )
        .setColor("#6A0CED")
        .setFooter(`Developed by ${client.config.owner.name}`)
    );
  }

  if (!content.toLowerCase().startsWith(prefix)) return;

  /**
   * @type {String[]}
   */
  const args = content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command =
    client.commands.get(commandName) ||
    client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) return;

  if (command.guildOnly && channel.type === "dm") {
    return message.reply("Can't run this command on private messages!");
  }

  if (command.clientPerms && !guild.me.permissions.has(command.clientPerms)) {
    const embed = new Embed()
      .setTitle(":no_entry: Permissions missing")
      .setDescription(
        `I need the following permissions to run this command\n${command.clientPerms.join(", ")}`
      );
    return channel.send(embed);
  }

  if (command.args && !args.length) {
    let embed = new Embed()
      .setDescription(`You have not entered any arguments, ${author}!`)
      .setColor("ORANGE");

    if (command.usage) {
      embed.addField("Usage", `The proper use is: \`${prefix}${command.name} ${command.usage}\``);
    }

    return channel.send(embed);
  }

  if (command.ownerOnly && author.id !== client.config.owner.id) {
    return message.reply(`Only the owner of ${client.user} can use this command!`);
  }

  if (command.support && guild.id !== client.config.support.id) {
    return message.reply("This is a dedicated guild command!");
  }

  if (!client.cooldowns.has(command.name)) {
    client.cooldowns.set(command.name, new Collection());
  }

  const now = Date.now();
  const timestamps = client.cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 3) * 1000;

  if (timestamps.has(author.id)) {
    const expirationTime = timestamps.get(author.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.reply(
        `please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${
          command.name
        }\` command.`
      );
    }
  }

  timestamps.set(author.id, now);
  setTimeout(() => timestamps.delete(author.id), cooldownAmount);

  try {
    command.callback(message, args, client);
  } catch (error) {
    console.error(error);
    message.reply("There was an error executing the command ⚠!");
  }
};
