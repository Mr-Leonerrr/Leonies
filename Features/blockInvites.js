const { MessageEmbed: Embed } = require("discord.js");

module.exports = {
  blocker: async (message) => {
    const { content, channel, member } = message;
    const regex =
      /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li|club)|discordapp\.com\/invite|discord\.com\/invite|dsc\.gg)\/.+[a-z]/gi;

    if (member.hasPermission("MANAGE_MESSAGES") || member.hasPermission("ADMINISTRATOR"))
      return;
    else if (regex.test(content)) {
      message.delete();
      channel.send(
        new Embed().setDescription(`${member.user} 🤡 Nice ads try!`).setColor("RED")
      );
      return;
    }
  },
};
