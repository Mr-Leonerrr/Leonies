module.exports = {
  name: "ban",
  aliases: ["b"],
  description: "Ban a user.",
  group: "Admin",
  memberName: "Ban",
  usage: "[@target]",
  args: true,
  cooldown: 5,
  guildOnly: true,
  callback: (message) => {
    let member = message.mentions.users.first();

    if (!message.member.hasPermission("MANAGE_MEMBERS"))
      return message.reply("You don't have permissions for ban this user!");

    if (!message.guild.me.hasPermission("MANAGE_MEMBERS")) {
      return message.reply("I don't have permissions for this!");
    } else {
      message.delete({ timeout: 1000 });
      return message.guild.members
        .ban(member)
        .then(() =>
          message.reply({
            embed: {
              title: "Banned",
              description: `**${member.username}** has been banned.`,
              color: 16515072,
              image: {
                url: "https://media.giphy.com/media/qPD4yGsrc0pdm/giphy.gif",
              },
            },
          })
        )
        .catch((error) => message.reply(`Sorry, an error has occurred: ${error}`));
    }
  },
};
