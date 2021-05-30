const { MessageEmbed: Embed } = require("discord.js");
const db = require("megadb");
let prefix_db = new db.crearDB("prefixes");

module.exports = {
  name: "help",
  aliases: ["command"],
  description: "Get the list of available commands or information about a specific command.",
  group: "Utility",
  memberName: "Help",
  usage: "<command name>",
  cooldown: 5,
  callback: async (message, args) => {
    const { client, guild, channel } = message;
    const funCommands = [],
      guildCommands = [],
      modCommands = [],
      musicCommands = [],
      utilCommands = [];

    let prefix = prefix_db.has(guild.id)
      ? await prefix_db.get(`${guild.id}.prefix`)
      : client.config.prefix;

    /**
     * Commands
     */

    if (!args.length) {
      client.commands.forEach((cmd) => {
        if (cmd.group == "Fun") funCommands.push(`\`${cmd.name}\``);
        if (cmd.group == "Guild") guildCommands.push(`\`${cmd.name}\``);
        if (cmd.group == "Moderation") modCommands.push(`\`${cmd.name}\``);
        if (cmd.group == "Music") musicCommands.push(`\`${cmd.name}\``);
        if (cmd.group == "Utility") utilCommands.push(`\`${cmd.name}\``);
      });

      let commandsPage = new Embed()
        .setTitle(`${client.user.username} Help`)
        .setDescription("List of all commands")
        .setThumbnail("https://mypass.ace-energy.co.th/asset/img/icon_helpdesk.png")
        .setColor(message.member.displayHexColor)
        .addFields(
          { name: "🏠 Guild", value: guildCommands.join(", ") },
          { name: "🎵 Music", value: musicCommands.join(", ") },
          { name: "🔐 Moderation", value: modCommands.join(", ") },
          { name: "🎱 Utility", value: utilCommands.join(", ") },
          { name: "😵 Fun", value: funCommands.join(", ") }
        )
        .setFooter(`You can send ${prefix}help [command name] to get info on a specific command.`);

      return channel.send(commandsPage);
    }
    const name = args[0].toLowerCase();
    const command =
      client.commands.get(name) ||
      client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(name));

    if (!command) return message.reply("that's not a valid command!");

    const cmdEmbed = new Embed()
      .setTitle("Command Information")
      .setColor(message.member.displayHexColor);

    cmdEmbed.addField("Name", command.memberName, true);

    if (command.aliases) {
      cmdEmbed.addField("Alias", `${command.aliases.join(", ")}`, true);
    }
    cmdEmbed.addField("Group", command.group, true);
    if (command.description) cmdEmbed.addField("Description", `${command.description}`);
    if (command.usage) {
      cmdEmbed.addField("Usage", `${prefix}${command.name} ${command.usage}`, true);
    }
    if (command.cooldown) {
      cmdEmbed.addField("Cooldown", `${command.cooldown || 3} second(s).`, true);
    }

    return channel.send(cmdEmbed);
  },
};
