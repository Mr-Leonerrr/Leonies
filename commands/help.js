const db = require("megadb");
let prefix_db = new db.crearDB("prefixes");
const { default_prefix } = require("../config.json");

module.exports = {
  name: "help",
  description:
    "Get the list of available commands or information about a specific command.",
  aliases: ["commands", "cmd"],
  group: "misc",
  memberName: "help",
  usage: "[command name]",
  cooldown: 5,
  async execute(client, message, args) {
    const data = [];
    const { commands } = message.client;
    let prefix = prefix_db.has(message.guild.id)
      ? await prefix_db.get(`${message.guild.id}.prefix`)
      : default_prefix;

    /**
     * COMMANDS
     **/

    if (!args.length) {
      data.push("Here's a list of all my commands:");
      data.push(commands.map((command) => command.name).join("\n "));
      data.push(
        `\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`
      );

      return message.author
        .send(data, { split: true })
        .then(() => {
          if (message.channel.type === "dm") return;
          message.reply("I've sent you a DM with all my commands!");
        })
        .catch((error) => {
          console.error(
            `Could not send help DM to ${message.author.tag}.\n`,
            error
          );
          message.reply("it seems like I can't DM you!😥");
        });
    }

    /**
     * HELP
     **/

    const name = args[0].toLowerCase();
    const command =
      commands.get(name) ||
      commands.find((c) => c.aliases && c.aliases.includes(name));

    if (!command) {
      return message.reply("that's not a valid command!");
    }

    data.push(`${command.name}`);

    if (command.aliases) data.push(`${command.aliases.join(", ")}`);
    if (command.description) data.push(`${command.description}`);
    if (command.usage) {
      data.push(`${prefix}${command.name} ${command.usage}`);
    } else {
      data.push("Undefined");
    }

    if (commands.cooldown) {
      data.push(`${command.cooldown || 3} second(s)`);
    } else {
      data.push("Undefined");
    }

    message.channel.send({
      embed: {
        title: "Command Information",
        color: "GREEN",
        fields: [
          {
            name: "**Name**",
            value: data[0],
            inline: true,
          },
          {
            name: "**Alias**",
            value: data[1],
            inline: true,
          },
          {
            name: "**Description**",
            value: data[2],
          },
          {
            name: "**Usage**",
            value: data[3],
          },
          {
            name: "**Cooldown**",
            value: data[4],
          },
        ],
      },
    });
  },
};
