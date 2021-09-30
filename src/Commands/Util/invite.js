const {Leonies: client} = require("../../Client/Leonies");
const {Message, MessageEmbed: Embed} = require("discord.js");

module.exports = {
  name: "invite",
  aliases: ["i", "in"],
  description: "Invite Leonies to your server or join the official server",
  group: "Utility",
  memberName: "Invite",
  cooldown: 2,
  /**
   * @param {Message} message
   */
  callback: (message) => {
    const {invite} = client.config.support;
    message.channel.send(
        new Embed().setTitle("Invitation").
            setThumbnail(client.user.displayAvatarURL({dynamic: true})).
            setColor("RANDOM").
            addField(
                "Invite Bot",
                `[Click here](${client.invite})`,
            ).
            addField("Support Server", `[Click here](${invite})`).
            setFooter(`Developed by ${client.config.owner.name}`),
    );
  },
};