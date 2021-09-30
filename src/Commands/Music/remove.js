const client = require("../../index");
const { Message, MessageEmbed: Embed } = require("discord.js");
const { error } = require("../../Include/Messages/status");
const db = require("megadb");
let prefix_db = new db.crearDB("prefixes");

module.exports = {
  name: "remove",
  aliases: ["rm", "r"],
  description: "Remove song from the queue.",
  usage: "<number song>",
  group: "Music",
  memberName: "Remove",
  args: true,
  guildOnly: true,
  cooldown: 3,
  /**
   * @param {Message} message
   * @param {String[]} args
   */
  callback: async (message, args) => {
	const serverQueue = client.queue.get(message.guildId);
	let prefix = prefix_db.has(message.guildId)
		? await prefix_db.get(`${message.guildId}.prefix`)
		: client.config.prefix;

	const position = parseInt(args[0]) - 1;
	if (isNaN(position)) {
	  return message.reply({ embeds: [error("That doesn't seem to be a number")] });
	}

	if (position === 0) {
	  return message.reply({ embeds: [error(`You can't remove the current song, use \`${prefix}skip\`.`)] });
	}

	if (!serverQueue.songs[position]) {
	  return message.reply({ embeds: [error("A song with that position doesn't exist in this queue.")] });
	}

	const songToRemove = serverQueue.songs.splice(position);
	serverQueue.txtChannel.send({
		  embeds: [
			new Embed().setDescription(
				`${message.author} ❌ removed **${songToRemove.fullTitle}** from the queue.`,
			).setColor("ORANGE")],
		},
	);
  },
};