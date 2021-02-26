const db = require("megadb");
let prefix_db = new db.crearDB("prefixes");
const { default_prefix } = require("../config.json");
module.exports = {
  name: "prefix",
  description: "Set the prefix for your server.",
  aliases: ["px", "pfx"],
  group: "misc",
  memberName: "prefix",
  usage: "[new prefix]",
  guildOnly: true,
  async execute(client, message, args) {
    const newPrefix = args.join(" ");
    if (!message.member.hasPermission("ADMINISTRATOR")) {
      return message
        .reply("You don't have permissions to use this command!")
        .then((msg) => {
          msg.delete(3000);
        });
    }

    if (!newPrefix && prefix_db.has(`${message.guild.id}`)) {
      let prefix = await prefix_db.get(`${message.guild.id}.prefix`);
      return message.channel.send({
        embed: {
          description: `The prefix of this server: **${prefix}**`,
          color: "RANDOM",
        },
      });
    }

    if (!newPrefix && !prefix_db.has(`${message.guild.id}`)) {
      return message.reply({
        embed: {
          description: `The prefix of this server: **${default_prefix}**`,
          color: 16515072,
        },
      });
    }
    message.channel
      .send({ embed: { description: "Setting prefix...", color: "RANDOM" } })
      .then((msg) => {
        prefix_db
          .set(message.guild.id, { prefix: newPrefix })
          .catch((error) => {
            msg.edit({
              embed: {
                description:
                  "An error has occurred and the new prefix could not be set.",
                color: 16515072,
              },
            });
            console.log(error.stack);
          })
          .then(
            () => {
              msg.edit({
                embed: {
                  title: "Updated",
                  description: `The server prefix has been set to **${newPrefix}**`,
                  color: 9437439,
                },
              });
            },
            { timeout: 3000 }
          );
      });
    return message.react("✅");
  },
};
