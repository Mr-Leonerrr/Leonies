const client = require("../../index");
const { Message, MessageEmbed: Embed, MessageActionRow, MessageButton } = require("discord.js");

module.exports = {
  name: "queue",
  aliases: ["q"],
  description: "Show current playlist.",
  group: "Music",
  memberName: "Queue",
  guildOnly: true,
  cooldown: 3,
  /**
   * Show the server queue
   * @param {Message} message
   */
  callback: async (message) => {
	let channel;
	if (message.channel.type === "GUILD_TEXT") {
	  channel = message.channel;
	}
	const { guild } = message;
	const serverQueue = client.queue.get(guild.id);

	if (serverQueue.tracks.length === 1) {
	  return client.commands.get("nowplaying").callback(message);
	}

	const previousPageBtn = new MessageButton().setEmoji("⬅️").setCustomId("previous-page").setStyle("PRIMARY");
	const stopEmbedBtn = new MessageButton().setEmoji("⬅").setCustomId("stop-embed").setStyle("PRIMARY");
	const nextPageBtn = new MessageButton().setEmoji("➡️️").setCustomId("next-page").setStyle("PRIMARY");
	const buttons = new MessageActionRow().addComponents([previousPageBtn, stopEmbedBtn, nextPageBtn]);

	let currentPage = 0;
	const pages = generateQueueEmbed(serverQueue.tracks);

	const queueEmbed = await channel.send(
		{ content: `**Current Page - ${currentPage + 1}/${pages.length}**`, embeds: [pages[currentPage]] },
	);

	if (pages.length > 1) {
	  try {
		await queueEmbed.react("⬅️");
		await queueEmbed.react("⏹");
		await queueEmbed.react("➡️");
	  } catch (error) {
		console.error(error);
		channel.send(error.message).catch((error) => console.error(error));
	  }
	}

	const filter = (reaction, user) =>
		["⬅️", "⏹", "➡️"].includes(reaction.emoji.name) && message.author.id ===
		user.id;
	const collector = queueEmbed.createReactionCollector({ filter, time: 60000 });

	collector.on("collect", async (reaction, user) => {
	  try {
		if (reaction.emoji.name === "➡️") {
		  if (currentPage < pages.length - 1) {
			currentPage++;
			await queueEmbed.edit(
				`Current Page - ${currentPage + 1}/${pages.length}`,
				pages[currentPage],
			);
		  }
		} else if (reaction.emoji.name === "⬅️") {
		  if (currentPage !== 0) {
			--currentPage;
			await queueEmbed.edit(
				{ content: `Current Page - ${currentPage + 1}/${pages.length}`, embeds: [pages[currentPage]] });
		  }
		} else {
		  collector.stop();
		  await reaction.message.reactions.removeAll();
		}
		await reaction.users.remove(message.author.id);
	  } catch (error) {
		console.error(error);
		return channel.send(error.message).
			catch((error) => console.error(error));
	  }
	});
  },
};

function generateQueueEmbed(serverQueue) {
  const pages = [];
  let songs = 11;

  for (let i = 1; i < serverQueue.length; i += 10) {
	const current = serverQueue.slice(i++, songs);
	let j = i - 1;
	songs += 10;

	const info = current.map(
		(track) => `${++j}. [${track.fullTitle}](${track.url}) | \`${track.duration}\``).
		join("\n");

	const embed = new Embed().setTitle("Songs Queue").
		setThumbnail(serverQueue[0].thumbnail).
		setDescription(
			`**Current Song \n[${serverQueue[0].fullTitle}](${serverQueue[0].url})**\n\n${info}`,
		).
		setColor("RANDOM").
		addField("Entries", `${serverQueue.length} Songs`, true);
	pages.push(embed);
  }
  return pages;
}