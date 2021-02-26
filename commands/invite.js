module.exports = {
  name: "invite",
  description: "Invite Leoncito to your server or join the official server",
  aliases: ["i", "in"],
  group: "misc",
  execute(client, message) {
    message.channel.send({
      embed: {
        title: "Invitation",
        thumbnail: { url: client.user.displayAvatarURL({ dynamic: true }) },
        fields: [
          {
            name: "Invite Bot",
            value: `[Click here](${client.invite})`,
          },
          {
            name: "Official Server",
            value: `[Click here](https://discord.gg/k4Tx8Ma)`,
          },
        ],
        footer: { text: client.ownerInfo },
      },
    });
  },
};
