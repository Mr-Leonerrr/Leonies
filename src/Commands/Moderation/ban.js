const { MessageEmbed: Embed, Message } = require("discord.js");

module.exports = {
  name: "ban",
  aliases: ["b"],
  description: "I can ban someone using this command, for you.",
  usage: "<member> [reason]",
  group: "Moderation",
  memberName: "Ban",
  clientPerms: ["BAN_MEMBERS"],
  args: true,
  guildOnly: true,
  cooldown: 5,
  /**
   * @param {Message} message
   * @param {String[]} args
   */
  callback: async (message, args) => {
    const { guild, channel, mentions, member, author } = message;

    if (!member.permissions.has("BAN_MEMBERS") || !member.permissions.has("ADMINISTRATOR")) {
      return message.reply("You don't have permissions for kick this user!");
    }

    const target = mentions.members.first() || guild.members.cache.get(args[0]);

    if (!target) {
      return message.reply("You need an ID to ban!");
    } else {
      let reason;
      if (!args[1]) reason = "No reason provided.";
      else reason = args.slice(1).join(" ");

      const authorPos = guild.members.resolve(author).roles.highest.position;
      const victimPos = guild.members.resolve(target).roles.highest.position;

      if (target.user.id == author.id) {
        return message.reply("are you okay? you trying to ban yourself!");
      }

      if (!message.guild.members.resolve(target).bannable) {
        return message.reply(
          `Hm, seems like I lack permissions to ban ${target.user.tag}. You need to put my role higher to theirs.`
        );
      }

      if (guild.owner.id == author.id) {
        try {
          await target.kick(reason);
          return await channel.send({
            embeds: [
              new Embed()
                .setTitle("Banned")
                .setColor("RED")
                .setDescription(`**${target.user.tag}** has been banned.`)
                .addField("Reason", reason),
            ],
          });
        } catch (error) {
          return await message.reply(`Sorry, an error has occurred: ${error}`);
        }
      }

      if (authorPos <= victimPos) {
        message.reply(
          `Well, I would not pull fights between you. You don't have enough permissions to kick ${target.user.tag}, because their highest role is above or same as yours.`
        );
        return;
      }

      if (authorPos > victimPos) {
        try {
          await target.kick(reason);
          return await channel.send({
            embeds: [
              new Embed()
                .setTitle("Banned")
                .setColor("RED")
                .setDescription(`**${target.user.tag}** has been banned.`)
                .addField("Reason", reason),
            ],
          });
        } catch (error_1) {
          return await message.reply(`Sorry, an error has occurred: ${error_1}`);
        }
      }
    }
  },
};
