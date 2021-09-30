const { Message } = require("discord.js");
const fs = require("fs");

module.exports = {
  name: "reload",
  aliases: ["reload-command", "relo", "rl"],
  description: "Reload a specify command.",
  usage: "<command name>",
  group: "Owner",
  memberName: "Reload Command",
  args: true,
  ownerOnly: true,
  cooldown: 5,
  /**
   * @param {Message} message
   * @param {String[]} args
   */
  callback: async (message, args) => {
    const { client, channel, author } = message;
    const commandName = args[0].toLowerCase();
    const command =
      client.commands.get(commandName) ||
      client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) {
      return message.channel.send(
        `There is no command with name or alias \`${commandName}\`, ${author}!`
      );
    }

    const commandFolders = fs.readdirSync("./Commands");
    const folderName = commandFolders.find((folder) =>
      fs.readdirSync(`./Commands/${folder}`).includes(`${command.name}.js`)
    );

    delete require.cache[require.resolve(`../${folderName}/${command.name}.js`)];

    try {
      const newCommand = require(`../${folderName}/${command.name}.js`);
      client.commands.set(newCommand.name, newCommand);
      channel.send(`Command \`${newCommand.name}\` was reloaded!`);
    } catch (error) {
      console.error(error);
      channel.send(
        `There was an error while reloading a command \`${command.name}\`:\n\`${error.message}\``
      );
    }
  },
};
