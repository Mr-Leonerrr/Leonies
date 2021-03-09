const Discord = require("discord.js");
const db = require("megadb");
let prefix_db = new db.crearDB("prefixes");
const { default_prefix } = require("../../config.json");
const { LOCALE } = require("../../util/LeoncitoUtil");
const i18n = require("i18n");

i18n.setLocale(LOCALE);

module.exports = {
  name: "help",
  aliases: ["command"],
  description: i18n.__("help.description"),
  group: "Utility",
  memberName: "Help",
  usage: "<command name>",
  cooldown: 5,
  callback: async (message, args) => {
    const { commands } = message.client;
    const adminCommands = [];
    const musicCommands = [];
    const serverCommands = [];
    const utilCommands = [];

    let prefix = prefix_db.has(message.guild.id)
      ? await prefix_db.get(`${message.guild.id}.prefix`)
      : default_prefix;

    /**
     * Commands
     */

    if (!args.length) {
      commands.forEach((cmd) => {
        if (cmd.group == "Admin") adminCommands.push(`\`${cmd.name}\``);
        if (cmd.group == "Music") musicCommands.push(`\`${cmd.name}\``);
        if (cmd.group == "Utility") utilCommands.push(`\`${cmd.name}\``);
      });

      let commandsPage = new Discord.MessageEmbed()
        .setTitle(i18n.__mf("help.embedTitle", { botname: message.client.user.username }))
        .setDescription(i18n.__("help.embedDescription"))
        .setThumbnail("https://mypass.ace-energy.co.th/asset/img/icon_helpdesk.png")
        .setColor(message.member.displayHexColor)
        .addFields(
          { name: i18n.__("help.adminTitle"), value: adminCommands.join(", ") },
          { name: i18n.__("help.musicTitle"), value: musicCommands.join(", ") },
          { name: i18n.__("help.utilityTitle"), value: utilCommands.join(", ") }
        )
        .setFooter(i18n.__mf("help.embedFooter", { prefix: prefix }));

      return message.channel.send(commandsPage);
    }
    const name = args[0].toLowerCase();
    const command =
      commands.get(name) || commands.find((cmd) => cmd.aliases && cmd.aliases.includes(name));

    if (!command) return message.reply("that's not a valid command!");

    const cmdEmbed = new Discord.MessageEmbed()
      .setTitle(i18n.__("commands.embedTitle"))
      .setColor(message.member.displayHexColor);

    cmdEmbed.addField(i18n.__("commands.nameField"), command.memberName, true);

    if (command.aliases) {
      cmdEmbed.addField(i18n.__("commands.aliasField"), `${command.aliases.join(", ")}`, true);
    }
    cmdEmbed.addField(i18n.__("commands.groupField"), command.group, true);
    if (command.description)
      cmdEmbed.addField(i18n.__("commands.descriptionField"), `${command.description}`);
    if (command.usage) {
      cmdEmbed.addField(
        i18n.__("commands.usageField"),
        `${prefix}${command.name} ${command.usage}`,
        true
      );
    }
    if (command.cooldown) {
      cmdEmbed.addField(
        i18n.__("commands.cooldownField"),
        i18n.__mf("commands.cooldownInfo", { cooldown: command.cooldown || 3 }),
        true
      );
    }

    return message.channel.send(cmdEmbed);
  },
};
