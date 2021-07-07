const { Message, MessageEmbed: Embed } = require("discord.js");

module.exports = {
  name: "avatar",
  aliases: ["icon", "pfp"],
  description: "Get the avatar URL of tagged users or your own avatar.",
  usage: "<@user> or none",
  group: "Utility",
  memberName: "Avatar",
  guildOnly: true,
  cooldown: 3,
  /**
   * @param {Message} message
   * @param {String[]} args
   */
  callback: async (message, args) => {
    const member =
      message.mentions.members.last() ||
      message.guild.members.cache.get(args[0]) ||
      message.member;

    let userInfo = {};
    userInfo.tag = member.tag;
    userInfo.id = member.id;
    userInfo.displayAvatar = member.user.displayAvatarURL({
      dynamic: true,
      size: 1024,
    });
    userInfo.avatarPNG = member.user.displayAvatarURL({
      size: 1024,
      format: "png",
    });
    userInfo.avatarJPG = member.user.displayAvatarURL({
      size: 1024,
      format: "jpg",
    });
    const emb = new Embed()
      .setColor(message.member.displayHexColor)
      .setAuthor(member.user.tag, member.user.displayAvatarURL({ dynamic: true }))
      .addField(
        "Link as",
        `[png](${userInfo.avatarPNG}) | [jpg](${userInfo.avatarJPG}) | [webp](${userInfo.displayAvatar})`
      )
      .setImage(userInfo.displayAvatar)
      .setFooter("What're you looking at?");

    message.channel.send(emb);
  },
};
