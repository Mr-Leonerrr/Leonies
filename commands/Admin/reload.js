const fs = require("fs");
const glob = require("glob");

module.exports = {
  name: "reload",
  description: "Reload a command.",
  aliases: ["rl", "relo"],
  group: "Owner",
  usage: "[command name]",
  args: true,
  guildOnly: true,
  callback: (client, message, args) => {
    const commandName = args[0].toLowerCase();
    const command =
      message.client.commands.get(commandName) ||
      message.client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) {
      return message.channel.send(
        `There is no command with the name/alias \`${commandName}\`, ${message.author}!`
      );
    }

    const adminPath = glob.sync(`../Admin/*.js`);
    const musicPath = glob.sync(`../Music/*.js`);
    const utilPath = glob.sync(`../Util/*.js`);

    if (message.member.id === "445403516970729482") {
      try {
        for (let i = 0; i < adminPath.length; i++) {
          const file = i.name;
          if (file === command.name) console.log("Admin path");
        }
        for (let i = 0; i < musicPath.length; i++) {
          const file = i.name;
          if (file === command.name) console.log("Music path");
        }
        for (let i = 0; i < utilPath.length; i++) {
          const file = i.name;
          if (file === command.name) console.log("Util path");
        }

        message.channel.send(`Command \`${command.name}\` has beed reloaded!`);
      } catch (error) {
        console.error(error);
        message.channel.send(
          `An error occurred while loading the command \`${command.name}\`:\n\`${error.message}\``
        );
      }
    } else {
      return message.reply("You can't use this command!🥴").then((msg) => {
        msg.delete(3000);
      });
    }
  },
};
