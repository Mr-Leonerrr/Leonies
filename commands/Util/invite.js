const { MessageEmbed: Embed } = require("discord.js");

module.exports = {
  name: "invite",
  aliases: ["i", "in"],
  description: "Invite Leoncito to your server or join the official server",
  group: "Utility",
  memberName: "Invite",
  cooldown: 2,
  callback: (message) => {
    message.channel.send(
      new Embed()
        .setTitle("Invitation")
        .setThumbnail(message.client.user.displayAvatarURL({ dynamic: true }))
        .setColor("RANDOM")
        .addFields(
          {
            name: "Invite Bot",
            value: `[Click here](${message.client.invite})`,
          },
          {
            name: "Official Server",
            value: `[Click here](https://discord.gg/uJguFNpkWUw)`,
          }
        )
        .setFooter(message.client.ownerInfo)
    );
  },
};
