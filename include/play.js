require("../Features/ExtendMessage"); //Inline Reply
const { MessageEmbed: Embed } = require("discord.js");
const ytdl = require("discord-ytdl-core");

module.exports = {
  async play(song, message) {
    const { guild, client, channel } = message;
    const serverQueue = client.queue.get(guild.id);

    if (!song) {
      const embMsg = new Embed();
      setTimeout(() => {
        if (serverQueue.connection.dispatcher && guild.me.voice.channel) return;
        serverQueue.txtChannel
          .send(embMsg.setDescription("Leaving voice channel...").setColor("RED"))
          .then((msg) => msg.delete({ timeout: 3500 }));
        serverQueue.voiceChannel.leave();
      }, 3000);
      serverQueue.txtChannel
        .send(embMsg.setDescription("❌ Music queue ended.").setColor("ORANGE"))
        .then((msg) => msg.delete({ timeout: 4000 }))
        .catch((error) => console.error(error));
      return client.queue.delete(guild.id);
    }

    let stream = null;
    let streamType = song.url.includes("youtube.com") ? "opus" : "ogg/opus";

    try {
      if (song.url.includes("youtube.com")) {
        stream = await ytdl(song.url, {
          filter: "audioonly",
          opusEncoded: false,
          fmt: "mp3",
          encoderArgs: ["-af", "bass=g=10,dynaudnorm=f=200"],
        });
      }
    } catch (error) {
      if (serverQueue) {
        serverQueue.songs.shift();
        module.exports.play(serverQueue.songs[0], message);
      }

      console.error(error);
      return channel.send(`Error: ${error.message ? error.message : error}`);
    }

    serverQueue.connection.on("disconnect", () => client.queue.delete(guild.id));

    try {
      let playingMessage = await serverQueue.txtChannel.send(
        new Embed()
          .setTitle("🎶 Started playing")
          .setDescription(`[${song.fullTitle}](${song.url})`)
          .setColor("RANDOM")
          .setThumbnail(song.thumbnail)
          .addField("Request by", song.requestBy, true)
          .addField("Duration", song.duration, true)
          .setTimestamp()
      );

      await playingMessage.react("⏯");
      await playingMessage.react("⏹");
      await playingMessage.react("⏭");
      await playingMessage.react("🔁");
      await playingMessage.react("🔇");
      await playingMessage.react("🔉");
      await playingMessage.react("🔊");

      const filter = (reaction, user) => user.id !== client.user.id;
      let collector = playingMessage.createReactionCollector(filter, {
        time: song.duration > 0 ? song.duration * 1000 : 600000,
      });

      const dispatcher = serverQueue.connection
        .play(stream, { type: "unknown" })
        .on("finish", () => {
          if (collector && !collector.ended) collector.stop();

          if (serverQueue.loopall || serverQueue.loopone) {
            // if loop is on, push the song back at the end of the serverQueue
            // so it can repeat endlessly
            let lastSong = serverQueue.songs.shift();
            serverQueue.songs.push(lastSong);
            module.exports.play(serverQueue.songs[0], message);
          } else {
            serverQueue.songs.shift();
            module.exports.play(serverQueue.songs[0], message);
          }
        })
        .on("error", (err) => {
          console.error(err);
          serverQueue.songs.shift();
          module.exports.play(serverQueue.songs[0], message);
        });
      dispatcher.setVolumeLogarithmic(serverQueue.volume / 100);

      collector.on("collect", (reaction, user) => {
        if (!serverQueue) return;
        const member = guild.member(user);

        switch (reaction.emoji.name) {
          case "⏯":
            reaction.users.remove(user).catch((error) => console.error(error));
            if (!member.voice.channel) {
              return message.inlineReply(
                new Embed().setDescription("You need to join a voice channel first!").setColor("RED")
              );
            }
            if (serverQueue.playing) {
              serverQueue.playing = !serverQueue.playing;
              serverQueue.connection.dispatcher.pause(true);
              serverQueue.txtChannel
                .send(new Embed().setDescription(`${user} ⏸ paused the music.`).setColor("ORANGE"))
                .catch((error) => console.error(error));
            } else {
              serverQueue.playing = !serverQueue.playing;
              serverQueue.connection.dispatcher.resume();
              serverQueue.txtChannel
                .send(new Embed().setDescription(`${user} ▶ resumed the music!`).setColor("GREEN"))
                .catch((error) => console.error(error));
            }
            break;

          case "⏹":
            reaction.users.remove(user).catch((error) => console.error(error));
            if (!member.voice.channel) {
              return message.inlineReply(
                new Embed().setDescription("You need to join a voice channel first!").setColor("RED")
              );
            }
            serverQueue.songs = [];
            serverQueue.txtChannel
              .send(new Embed().setDescription(`${user} ⏹ stopped the music!`).setColor("RED"))
              .catch((error) => console.error(error));
            try {
              serverQueue.connection.dispatcher.end();
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
              return message.inlineReply(
                new Embed().setDescription("You need to join a voice channel first!").setColor("RED")
              );
            }
            serverQueue.connection.dispatcher.end();
            serverQueue.txtChannel
              .send(`${user} ⏩ skipped the song`)
              .catch((error) => console.error(error));
            collector.stop();
            break;

          case "🔁":
            reaction.users.remove(user).catch((error) => console.error(error));
            if (!member.voice.channel) {
              return message.inlineReply(
                new Embed().setDescription("You need to join a voice channel first!").setColor("RED")
              );
            }
            serverQueue.loopone = !serverQueue.loopone;
            serverQueue.loopall = false;
            serverQueue.txtChannel
              .send(`${user} Loop is now ${serverQueue.loopone ? "**ON**" : "**OFF**"}`)
              .catch((error) => console.error(error));
            break;

          case "🔇":
            reaction.users.remove(user).catch((error) => console.error(error));
            if (!member.voice.channel) {
              return message.inlineReply(
                new Embed().setDescription("You need to join a voice channel first!").setColor("RED")
              );
            }
            if (serverQueue.volume <= 0) {
              serverQueue.volume = 100;
              serverQueue.connection.dispatcher.setVolumeLogarithmic(100 / 100);
              serverQueue.txtChannel
                .send(new Embed().setDescription(`${user} 🔊 unmuted the music!`).setColor("GREEN"))
                .catch((error) => console.error(error));
            } else {
              serverQueue.volume = 0;
              serverQueue.connection.dispatcher.setVolumeLogarithmic(0);
              serverQueue.txtChannel
                .send(new Embed().setDescription(`${user} 🔇 muted the music!`).setColor("ORANGE"))
                .catch((error) => console.error(error));
            }
            break;

          case "🔉":
            reaction.users.remove(user).catch((error) => console.error(error));
            if (!member.voice.channel) {
              return message.inlineReply(
                new Embed().setDescription("You need to join a voice channel first!").setColor("RED")
              );
            }
            if (serverQueue.volume == 0) return;
            if (serverQueue.volume - 10 <= 0) serverQueue.volume = 0;
            else serverQueue.volume = serverQueue.volume - 10;
            serverQueue.connection.dispatcher.setVolumeLogarithmic(serverQueue.volume / 100);
            serverQueue.txtChannel
              .send(
                new Embed()
                  .setDescription(
                    `${user} 🔉 decreased the volume, the volume is now ${serverQueue.volume}%`
                  )
                  .setColor("ROSE")
              )
              .catch((error) => console.error(error));
            break;

          case "🔊":
            reaction.users.remove(user).catch((error) => console.error(error));
            if (!member.voice.channel) {
              return message.inlineReply(
                new Embed().setDescription("You need to join a voice channel first!").setColor("RED")
              );
            }
            if (serverQueue.volume == 100) return;
            if (serverQueue.volume + 10 >= 100) serverQueue.volume = 100;
            else serverQueue.volume = serverQueue.volume + 10;
            serverQueue.connection.dispatcher.setVolumeLogarithmic(serverQueue.volume / 100);
            serverQueue.txtChannel
              .send(
                new Embed()
                  .setDescription(
                    `${user} 🔊 increased the volume, the volume is now ${serverQueue.volume}%`
                  )
                  .setColor("PURPLE")
              )
              .catch((error) => console.error(error));
            break;

          default:
            reaction.users.remove(user).catch((error) => console.error(error));
            break;
        }
      });

      collector.on("end", () => {
        playingMessage.reactions.removeAll().catch((error) => console.error(error));
        if (playingMessage && !playingMessage.deleted) {
          playingMessage.delete({ timeout: 3000 }).catch((error) => console.error(error));
        }
      });
    } catch (error) {
      console.error(error);
    }
  },
};
