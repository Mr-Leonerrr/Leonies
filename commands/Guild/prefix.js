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
    const { client, guild, channel, member } = message;
    if (!member.hasPermission("ADMINISTRATOR")) {
      return message
        .inlineReply("You don't have permissions to use this command!")
        .then((msg) => {
          msg.delete({ timeout: 3000 });
        });
    }

    if (!newPrefix && prefix_db.has(`${guild.id}`)) {
      let prefix = await prefix_db.get(`${guild.id}.prefix`);
      const emb = new Embed()
        .setDescription(`The prefix of this server: **${prefix}**`)
        .setColor(member.displayHexColor);
      return message.inlineReply({ embed: emb, allowedMentions: { repliedUser: false } });
    }

    if (!newPrefix && !prefix_db.has(`${guild.id}`)) {
      const emb = new Embed()
        .setDescription(`The prefix of this server: **${client.config.prefix}**`)
        .setColor(member.displayHexColor);
      return message.inlineReply({ embed: emb, allowedMentions: { repliedUser: false } });
    }

    let settingEmbed = new Embed();
    return channel
      .send(settingEmbed.setDescription("Setting prefix...").setColor("RANDOM"))
      .then((msg) => {
        try {
          prefix_db.set(guild.id, { prefix: newPrefix });
        } catch (error) {
          console.error(error.message);

          msg.edit(
            settingEmbed
              .setDescription("An error has occurred and the new prefix could not be set.")
              .setColor("RED")
          );
        }
        setTimeout(() => {
          msg.edit(
            settingEmbed
              .setTitle("Updated")
              .setDescription(`The server prefix has been set to **${newPrefix}**`)
              .setColor("PURPLE")
          );
        }, 2000);
      });
  },
};
