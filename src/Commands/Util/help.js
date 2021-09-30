const {Leonies: client} = require("../../Client/Leonies");
const {Message, MessageEmbed: Embed} = require("discord.js");
const db = require("megadb");
const prefix_db = new db.crearDB("prefixes");

module.exports = {
  name: "help",
  aliases: ["command"],
  description: "Get the list of available commands or information about a specific command.",
  group: "Utility",
  memberName: "Help",
  usage: "<command name>",
  cooldown: 5,
  /**
   * @param {Message} message
   * @param {String[]} args
   */
  callback: async (message, args) => {
    const funCommands = [],
        guildCommands = [],
        modCommands = [],
        musicCommands = [],
        utilCommands = [];

    let prefix = prefix_db.has(guild.id)
        ? await prefix_db.get(`${message.guildId}.prefix`)
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

      const commandsPage = new Embed().setTitle(`${client.user.username} Help`).
          setDescription("List of all commands").
          setThumbnail(
              "https://mypass.ace-energy.co.th/asset/img/icon_helpdesk.png").
          setColor(message.member.displayHexColor).
          addField("🏠 Guild", guildCommands.join(", ")).
          addField("🎵 Music", musicCommands.join(", ")).
          addField("🔐 Moderation", modCommands.join(", ")).
          addField("🎱 Utility", utilCommands.join(", ")).
          addField("😵 Fun", funCommands.join(", ")).
          setFooter(`You can send ${prefix}help [command name] to get info on a specific command.`);

      return message.channel.send({embeds: [commandsPage]});
    }
    const name = args[0].toLowerCase();
    const command =
        client.commands.get(name) ||
        client.commands.find(
            (cmd) => cmd.aliases && cmd.aliases.includes(name));

    if (!command) return message.reply("that's not a valid command!");

    const cmdEmbed = new Embed().setTitle("Command Information").setColor(message.member.displayHexColor);

    cmdEmbed.addField("Name", command.memberName, true);

    if (command.aliases) {
      cmdEmbed.addField("Alias", `${command.aliases.join(", ")}`, true);
    }
    cmdEmbed.addField("Group", command.group, true);
    if (command.description) cmdEmbed.addField("Description",
        `${command.description}`);
    if (command.usage) {
      cmdEmbed.addField("Usage", `${prefix}${command.name} ${command.usage}`,
          true);
    }
    if (command.cooldown) {
      cmdEmbed.addField("Cooldown", `${command.cooldown || 3} second(s).`,
          true);
    }

    return message.channel.send({embeds: [cmdEmbed]});
  },
};