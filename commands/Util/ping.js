const { MessageEmbed: Embed } = require("discord.js");

module.exports = {
  name: "ping",
  description: "Know the response time of the bot.",
  group: "Utility",
  memberName: "Ping",
  cooldown: 5,
  callback: (message) => {
    message.channel.send(
      new Embed()
        .setTitle("🏓 Pong!")
        .setDescription(
          `📨 • Sending Messages: \`${
            Date.now() - message.createdTimestamp
          } ms\` \n📡 • Discord API: \`${Math.round(message.client.ws.ping)} ms\``
        )
        .setColor(message.member.displayHexColor)
    );
  },
};
