const { MessageEmbed: Embed } = require("discord.js");

module.exports = {
  name: "invite",
  aliases: ["i", "in"],
  description: "Invite Leonies to your server or join the official server",
  group: "Utility",
  memberName: "Invite",
  cooldown: 2,
  callback: (message) => {
    const { client } = message;
    message.channel.send(
      new Embed()
        .setTitle("Invitation")
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
        .setColor("RANDOM")
        .addFields(
          {
            name: "Invite Bot",
            value: `[Click here](${client.invite})`,
          },
          {
            name: "Official Server",
            value: `[Click here](${client.config.support.invite})`,
          }
        )
        .setFooter(`Developed by ${client.config.owner.name}`)
    );
  },
};
