const { Leonies: client } = require("../../Client/Leonies");
const { MessageEmbed: Embed, Message } = require("discord.js");
const db = require("megadb");
let prefix_db = new db.crearDB("prefixes");

module.exports = {
  name: "prefix",
  description: "Set the prefix for your server.",
  aliases: ["px", "pfx"],
  usage: "[new prefix]",
  group: "Guild",
  memberName: "Prefix",
  guildOnly: true,
  cooldown: 3,
  /**
   * @param {Message} message
   * @param {String[]} args
   */
  callback: async (message, args) => {
    const newPrefix = args.join(" ");
    const { guild, channel, member } = message;
    if (!member.hasPermission("ADMINISTRATOR")) {
      return message.reply("You don't have permissions to use this command!").then((msg) => {
        setTimeout(() => msg.delete(), 3000);
      });
    }

    const emb = new Embed().setColor(member.displayColor);

    if (!newPrefix && prefix_db.has(`${guild.id}`)) {
      const prefix = await prefix_db.get(`${guild.id}.prefix`);
      emb.setDescription(`The prefix of this server: **${prefix}**`);
      return message.reply({ embeds: [emb], allowedMentions: { repliedUser: false } });
    }

    if (!newPrefix && !prefix_db.has(`${guild.id}`)) {
      emb.setDescription(`The prefix of this server: **${client.config.prefix}**`);
      return message.reply({ embeds: [emb], allowedMentions: { repliedUser: false } });
    }

    const settingEmbed = new Embed();
    return channel
      .send({ embeds: [settingEmbed.setDescription("Setting prefix...").setColor("RANDOM")] })
      .then((msg) => {
        try {
          prefix_db.set(guild.id, { prefix: newPrefix });
        } catch (error) {
          console.error(error.message);

          msg.edit({
            embeds: [
              settingEmbed
                .setDescription("An error has occurred and the new prefix could not be set.")
                .setColor("RED"),
            ],
          });
        }
        setTimeout(() => {
          msg.edit({
            embeds: [
              settingEmbed
                .setTitle("Updated")
                .setDescription(`The server prefix has been set to **${newPrefix}**`)
                .setColor("PURPLE"),
            ],
          });
        }, 2000);
      });
  },
};
