module.exports = {
  name: "avatar",
  description: "Get the avatar URL of tagged users or your own avatar.",
  aliases: ["icon", "pfp"],
  group: "misc",
  usage: "[@user]",
  memberName: "avatar",
  cooldown: 3,
  execute(client, message) {
    const userMention = message.mentions.users.first() || message.author;

    let userInfo = {};
    userInfo.tag = userMention.tag;
    userInfo.id = userMention.id;
    userInfo.displayAvatar = userMention.displayAvatarURL({
      dynamic: true,
      size: 1024,
    });
    userInfo.avatarPNG = userMention.displayAvatarURL({
      size: 1024,
      format: "png",
    });
    userInfo.avatarJPG = userMention.displayAvatarURL({
      size: 1024,
      format: "jpg",
    });
    let emb = {
      embed: {
        color: 5814783,
        author: {
          name: userInfo.tag,
          icon_url: userInfo.displayAvatar,
        },
        fields: [
          {
            name: "Link as",
            value: `[png](${userInfo.avatarPNG}) | [jpg](${userInfo.avatarJPG}) | [webp](${userInfo.displayAvatar})`,
          },
        ],
        image: { url: userInfo.displayAvatar },
        footer: { text: "What're u looking at?" },
      },
    };

    message.channel.send(emb);
  },
};
