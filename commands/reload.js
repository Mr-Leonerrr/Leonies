module.exports = {
  name: "reload",
  description: "Reload a command.",
  aliases: ["rl", "relo"],
  group: "owner",
  usage: "[command name]",
  args: true,
  guildOnly: true,
  execute(client, message, args) {
    const commandName = args[0].toLowerCase();
    const command =
      message.client.commands.get(commandName) ||
      message.client.commands.find(
        (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
      );

    if (!command) {
      return message.channel.send(
        `There is no command with the name/alias \`${commandName}\`, ${message.author}!`
      );
    }

    if (message.member.id === "445403516970729482") {
      delete require.cache[require.resolve(`./${command.name}.js`)];

      try {
        const newCommand = require(`./${command.name}.js`);
        message.client.commands.set(newCommand.name, newCommand);
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
