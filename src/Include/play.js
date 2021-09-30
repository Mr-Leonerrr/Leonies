const { Leonies: client } = require("../Client/Leonies");
const { Track } = require("../Models/Track");
const { Message, MessageEmbed: Embed } = require("discord.js");
const ytdl = require("discord-ytdl-core");
const { VoiceConnectionStatus } = require("@discordjs/voice");

module.exports = {
  /**
   * @param {Track} track
   * @param {Message} message
   */
  async play(track, message) {
	const { guild, channel } = message;
	const serverQueue = client.queue.get(guild.id);

	if (!track) {
	  const embMsg = new Embed();
	  setTimeout(() => {
		if (serverQueue.connection && guild.me.voice.channel) return;
		serverQueue.txtChannel.send({ embeds: [embMsg.setDescription("Leaving voice channel...").setColor("RED")] }).
			then((msg) => setTimeout(() => msg.delete(), 3500));
		serverQueue.voiceChannel.leave();
	  }, 3000);
	  serverQueue.txtChannel.send({ embeds: [embMsg.setDescription("❌ Music queue ended.").setColor("ORANGE")] }).
		  then((msg) => setTimeout(() => msg.delete(), 4000)).
		  catch((error) => console.error(error));
	  return client.queue.delete(guild.id);
	}

	let stream = null;
	let streamType = track.url.includes("youtube.com") ? "opus" : "ogg/opus";

	try {
	  if (track.url.includes("youtube.com")) {
		stream = await ytdl(track.url, {
		  filter: "audioonly",
		  quality: "highestaudio",
		  opusEncoded: true,
		});
	  }
	} catch (error) {
	  if (serverQueue) {
		serverQueue.songs.shift();
		await module.exports.play(serverQueue.songs[0], message);
	  }

	  console.error(error);
	  return channel.send(`Error: ${error.message ? error.message : error}`);
	}


	try {
	  const playingMessage = await serverQueue.txtChannel.send(
		  new Embed().setTitle("🎶 Started playing").
			  setDescription(`[${track.fullTitle}](${track.url})`).
			  setColor("RANDOM").
			  setThumbnail(track.thumbnail).
			  addField("Request by", `${track.requestedBy}`, true).
			  addField("Duration", track.duration, true).
			  setTimestamp(),
	  );

	  await playingMessage.react("⏯");
	  await playingMessage.react("⏹");
	  await playingMessage.react("⏭");
	  await playingMessage.react("🔁");
	  await playingMessage.react("🔇");
	  await playingMessage.react("🔉");
	  await playingMessage.react("🔊");

	  const filter = (reaction, user) => user.id !== client.user.id;
	  let collector = playingMessage.createReactionCollector({
		filter,
		time: track.duration > 0 ? track.duration * 1000 : 600000,
	  });

	  const dispatcher = serverQueue.connection.subscribe(stream, { type: streamType }).on("finish", () => {
		if (collector && !collector.ended) collector.stop();

		if (serverQueue.loopone) {
		  module.exports.play(serverQueue.songs[0], message);
		} else if (serverQueue.loopall) {
		  let lastSong = serverQueue.songs.shift();
		  serverQueue.songs.push(lastSong);
		  module.exports.play(serverQueue.songs[0], message);
		} else {
		  serverQueue.songs.shift();
		  module.exports.play(serverQueue.songs[0], message);
		}
	  }).on("error", (err) => {
		console.error(err);
		serverQueue.songs.shift();
		module.exports.play(serverQueue.songs[0], message);
	  });
	  dispatcher.setVolumeLogarithmic(serverQueue.volume / 100);

	  collector.on("collect", (reaction, user) => {
		if (!serverQueue) return;
		const member = guild.members.cache.get(user.id);

		switch (reaction.emoji.name) {
		  case "⏯":
			reaction.users.remove(user).catch((error) => console.error(error));
			if (!member.voice.channel) {
			  return message.reply({
				embeds: [
				  new Embed().setDescription("You need to join a voice channel first!").setColor("RED")],
			  });
			}
			if (serverQueue.playing) {
			  serverQueue.playing = !serverQueue.playing;
			  serverQueue.connection.pause();
			  serverQueue.txtChannel.send(
				  { embeds: [new Embed().setDescription(`${user} ⏸ paused the music.`).setColor("ORANGE")] }).
				  catch((error) => console.error(error));
			} else {
			  serverQueue.playing = !serverQueue.playing;
			  serverQueue.connection.resume();
			  serverQueue.txtChannel.send(
				  { embeds: [new Embed().setDescription(`${user} ▶ resumed the music!`).setColor("GREEN")] }).
				  catch((error) => console.error(error));
			}
			break;

		  case "⏹":
			reaction.users.remove(user).catch((error) => console.error(error));
			if (!member.voice.channel) {
			  return message.inlineReply(
				  new Embed().setDescription("You need to join a voice channel first!").setColor("RED"),
			  );
			}
			serverQueue.songs = [];
			serverQueue.txtChannel.send(
				{ embeds: [new Embed().setDescription(`${user} ⏹ stopped the music!`).setColor("RED")] }).
				catch((error) => console.error(error));
			try {
			  serverQueue.connection.end();
			} catch (error) {
			  console.error(error);
			  serverQueue.connection.disconnect();
			}
			collector.stop();
			break;

		  case "⏭":
			reaction.users.remove(user).catch((error) => console.error(error));
			serverQueue.playing = true;
			if (!member.voice.channel) {
			  return message.reply({
				embeds: [
				  new Embed().setDescription("You need to join a voice channel first!").setColor("RED"),
				],
			  });
			}
			serverQueue.connection.end();
			serverQueue.txtChannel.send(`${user} ⏩ skipped the song`).catch((error) => console.error(error));
			collector.stop();
			break;

		  case "🔁":
			reaction.users.remove(user).catch((error) => console.error(error));
			if (!member.voice.channel) {
			  return message.reply({
				embeds: [
				  new Embed().setDescription("You need to join a voice channel first!").setColor("RED"),
				],
			  });
			}
			serverQueue.loopone = !serverQueue.loopone;
			serverQueue.loopall = false;
			serverQueue.txtChannel.send(`${user} Loop is now ${serverQueue.loopone ? "**ON**" : "**OFF**"}`).
				catch((error) => console.error(error));
			break;

		  case "🔇":
			reaction.users.remove(user).catch((error) => console.error(error));
			if (!member.voice.channel) {
			  return message.reply({
				embeds: [
				  new Embed().setDescription("You need to join a voice channel first!").setColor("RED"),
				],
			  });
			}
			if (serverQueue.volume <= 0) {
			  serverQueue.volume = 100;
			  serverQueue.connection.setVolumeLogarithmic(100 / 100);
			  serverQueue.txtChannel.send({
				embeds: [
				  new Embed().setDescription(`${user} 🔊 unmuted the music!`).setColor("GREEN")],
			  }).
				  catch((error) => console.error(error));
			} else {
			  serverQueue.volume = 0;
			  serverQueue.connection.setVolumeLogarithmic(0);
			  serverQueue.txtChannel.send(new Embed().setDescription(`${user} 🔇 muted the music!`).setColor("ORANGE")).
				  catch((error) => console.error(error));
			}
			break;

		  case "🔉":
			reaction.users.remove(user).catch((error) => console.error(error));
			if (!member.voice.channel) {
			  return message.reply({
				embeds: [
				  new Embed().setDescription("You need to join a voice channel first!").setColor("RED"),
				],
			  });
			}
			if (serverQueue.volume === 0) return;
			if (serverQueue.volume - 10 <= 0) serverQueue.volume = 0;
			else serverQueue.volume = serverQueue.volume - 10;
			serverQueue.connection.setVolumeLogarithmic(serverQueue.volume / 100);
			serverQueue.txtChannel.send({
			  embeds: [
				new Embed().setDescription(
					`${user} 🔉 decreased the volume, the volume is now ${serverQueue.volume}%`,
				).setColor("PURPLE"),
			  ],
			}).catch((error) => console.error(error));
			break;

		  case "🔊":
			reaction.users.remove(user).catch((error) => console.error(error));
			if (!member.voice.channel) {
			  return message.reply({
				embeds: [
				  new Embed().setDescription("You need to join a voice channel first!").setColor("RED"),
				],
			  });
			}
			if (serverQueue.volume === 100) return;
			if (serverQueue.volume + 10 >= 100) serverQueue.volume = 100;
			else serverQueue.volume = serverQueue.volume + 10;
			serverQueue.connection.setVolumeLogarithmic(serverQueue.volume / 100);
			serverQueue.txtChannel.send(
				new Embed().setDescription(
					`${user} 🔊 increased the volume, the volume is now ${serverQueue.volume}%`,
				).setColor("PURPLE"),
			).catch((error) => console.error(error));
			break;

		  default:
			reaction.users.remove(user).catch((error) => console.error(error));
			break;
		}
	  });

	  collector.on("end", () => {
		playingMessage.reactions.removeAll().catch((error) => console.error(error));
		if (playingMessage && !playingMessage.deleted) {
		  setTimeout(() => playingMessage.delete(), 3000);
		}
	  });
	} catch (error) {
	  console.error(error);
	}
  },
};