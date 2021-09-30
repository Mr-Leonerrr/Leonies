const client = require("../../index");
const { TextChannel, MessageEmbed: Embed, Message } = require("discord.js");

module.exports = {
  name: "loop",
  aliases: ["lp"],
  description: "Repeat the current song or queue.",
  usage: "[all | one | off]",
  group: "Music",
  memberName: "Loop",
  guildOnly: true,
  cooldown: 3,
  /**
   * @param {Message} message
   * @param {String[]} args
   */
  callback: async (message, args) => {
	/**
	 * @type {TextChannel}
	 */
	const channel = message.channel;
	const { guild, member } = message;
	const queue = client.queue.get(guild.id);
	const voiceChannel = member.voice.channel;
	if (!voiceChannel) {
	  return message.reply({
		embeds: [
		  new Embed().setDescription("You're not on a voice channel!").setColor("RED")],
	  });
	}

	if (queue && voiceChannel.id !== guild.me.voice.channelId) {
	  return message.reply({
			embeds: [
			  new Embed().setDescription(`You must be in the same channel as ${client.user}`).setColor("RED")],
		  },
	  ).catch((error) => console.error(error));
	}

	if (!queue) return message.reply("There is no music playing!");

	if (!args.length) {
	  queue.loopall = !queue.loopall;
	  queue.loopone = false;

	  if (queue.loopall === true) {
		await message.react("🔁");
	  } else {
		await message.reply({
			  embeds: [
				new Embed().setDescription("Loop all has been `turned off!`").setColor("ORANGE")],
			},
		);
	  }
	} else {
	  switch (args[0].toLowerCase()) {
		case "all":
		  queue.loopall = !queue.loopall;
		  queue.loopone = false;

		  if (queue.loopall === true) {
			await message.react("🔁");
		  } else {
			await message.reply({
				  embeds: [
					new Embed().setDescription("Loop all has been `turned off!`").setColor("ORANGE")],
				},
			);
		  }
		  break;

		case "one":
		  queue.loopone = !queue.loopone;
		  queue.loopall = false;

		  if (queue.loopone === true) {
			await message.react("🔂");
		  } else {
			await message.reply({
				  embeds: [
					new Embed().setDescription("Loop one has been `turned off!`").setColor("ORANGE")],
				},
			);
		  }
		  break;

		case "off":
		  queue.loopall = false;
		  queue.loopone = false;

		  channel.send({
				embeds: [
				  new Embed().setDescription("Loop has been `turned off`!").setColor("ORANGE")],
			  },
		  );
		  break;
	  }
	}
  },
};