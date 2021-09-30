const client = require("../../index");
const { Message, MessageEmbed: Embed } = require("discord.js");

module.exports = {
  name: "resume",
  aliases: ["r", "resume-song", "continue"],
  description: "Resume the current paused song.",
  group: "Music",
  memberName: "Resume",
  guildOnly: true,
  cooldown: 5,
  /**
   * @param {Message} message
   */
  callback: async (message) => {
	const serverQueue = client.queue.get(message.guildId);

	if (!serverQueue.connection.isPaused())
	  return message.reply("The song is already playing!");

	await message.react("▶");
	serverQueue.connection.resume();
  },
};