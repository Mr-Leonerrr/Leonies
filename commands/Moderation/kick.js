require("../../Features/ExtendMessage"); //Inline Reply
const { MessageEmbed: Embed } = require("discord.js");

module.exports = {
  name: "kick",
  aliases: ["k"],
  description: "I can kick someone using this command, for you.",
  usage: "<@member | member-id> [reason]",
  group: "Moderation",
  memberName: "Kick",
  args: true,
  guildOnly: true,
  cooldown: 5,
  callback: (message, args) => {
    const { guild, channel, mentions, member, author } = message;

    if (!member.hasPermission("KICK_MEMBERS") || !member.hasPermission("ADMINISTRATOR")) {
      return message.inlineReply("You don't have permissions for kick this user!");
    }

    if (!guild.me.hasPermission("KICK_MEMBERS")) {
      return message.inlineReply("I don't have permissions for this!");
    }

    const target = mentions.members.first() || guild.members.cache.get(args[0]);

    if (!target) {
      return message.inlineReply("You need mention someone to kick!");
    } else {
      let reason;
      if (!args[1]) reason = "No reason provided.";
      else reason = args.slice(1).join(" ");

      const authorPos = guild.members.resolve(author).roles.highest.position;
      const victimPos = guild.members.resolve(target).roles.highest.position;

      if (target.user.id == author.id) {
        return message.inlineReply("are you okay? you trying to kick yourself!");
      }

      if (!message.guild.members.resolve(target).kickable) {
        return message.inlineReply(
          `Hm, seems like I lack permissions to kick ${target.user.tag}. You need to put my role higher to theirs.`
        );
      }

      if (guild.owner.id == author.id) {
        return target
          .kick(reason)
          .then(() =>
            channel.send(
              new Embed()
                .setTitle("Kicked")
                .setColor("RED")
                .setDescription(`**${target.user.tag}** has been kicked.`)
                .addField("Reason", reason)
            )
          )
          .catch((error) => message.reply(`Sorry, an error has occurred: ${error}`));
      }

      if (authorPos <= victimPos) {
        message.inlineReply(
          `Well, I would not pull fights between you. You don't have enough permissions to kick ${target.user.tag}, because their highest role is above or same as yours.`
        );
        return;
      }

      if (authorPos > victimPos) {
        return target
          .kick(reason)
          .then(() =>
            channel.send(
              new Embed()
                .setTitle("Kicked")
                .setColor("RED")
                .setDescription(`**${target.user.tag}** has been kicked.`)
                .addField("Reason", reason)
            )
          )
          .catch((error) => message.reply(`Sorry, an error has occurred: ${error}`));
      }
    }
  },
};
