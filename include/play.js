const { MessageEmbed: Embed } = require("discord.js");
const ytdl = require("discord-ytdl-core");
const { canModifyQueue, STAY_TIME, LOCALE } = require("../util/LeoncitoUtil");
const i18n = require("i18n");
i18n.setLocale(LOCALE);

module.exports = {
  async play(song, message) {
    let config;

    try {
      config = require("../config.json");
    } catch (error) {
      config = null;
    }

    const PRUNING = config ? config.PRUNING : process.env.PRUNING;

    const serverQueue = message.client.queue.get(message.guild.id);

    if (!song) {
      setTimeout(function () {
        if (serverQueue.connection.dispatcher && message.guild.me.voice.channel)
          return;
        serverQueue.voiceChannel.leave();
        serverQueue.txtChannel.send(i18n.__("play.leaveChannel"));
      }, STAY_TIME * 1000);
      serverQueue.txtChannel
        .send(i18n.__("play.queueEnded"))
        .catch(console.error);
      return message.client.queue.delete(message.guild.id);
    }

    let stream = null;

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
      return message.channel.send(
        i18n.__mf("play.queueError", {
          error: error.message ? error.message : error,
        })
      );
    }

    serverQueue.connection.on("disconnect", () =>
      message.client.queue.delete(message.guild.id)
    );

    const dispatcher = serverQueue.connection
      .play(stream, { type: "unknown" })
      .on("finish", () => {
        if (collector && !collector.ended) collector.stop();

        if (serverQueue.loop) {
          // if loop is on, push the song back at the end of the serverQueue
          // so it can repeat endlessly
          let lastSong = serverQueue.songs.shift();
          serverQueue.songs.push(lastSong);
          module.exports.play(serverQueue.songs[0], message);
        } else {
          // Recursively play the next song
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

    try {
      var playingMessage = await serverQueue.txtChannel.send(
        new Embed()
          .setTitle(i18n.__("play.startedPlayingTitle"))
          .setDescription(
            i18n.__mf("play.startedPlayingSong", {
              title: song.title,
              url: song.url,
            })
          )
          .setColor("RANDOM")
          .addField("Request by:", song.requestBy, true)
          .addField("Duration", song.duration, true)
          .setTimestamp()
      );
      await playingMessage.react("⏭");
      await playingMessage.react("⏯");
      await playingMessage.react("🔇");
      await playingMessage.react("🔉");
      await playingMessage.react("🔊");
      await playingMessage.react("🔁");
      await playingMessage.react("⏹");
    } catch (error) {
      console.error(error);
    }

    const filter = (reaction, user) => user.id !== message.client.user.id;
    var collector = playingMessage.createReactionCollector(filter, {
      time: song.duration > 0 ? song.duration * 1000 : 600000,
    });

    collector.on("collect", (reaction, user) => {
      if (!serverQueue) return;
      const member = message.guild.member(user);

      switch (reaction.emoji.name) {
        case "⏭":
          serverQueue.playing = true;
          reaction.users.remove(user).catch(console.error);
          if (!canModifyQueue(member)) return i18n.__("common.errorNotChannel");
          serverQueue.connection.dispatcher.end();
          serverQueue.txtChannel
            .send(i18n.__mf("play.skipSong", { author: user }))
            .catch(console.error);
          collector.stop();
          break;

        case "⏯":
          reaction.users.remove(user).catch(console.error);
          if (!canModifyQueue(member)) return i18n.__("common.errorNotChannel");
          if (serverQueue.playing) {
            serverQueue.playing = !serverQueue.playing;
            serverQueue.connection.dispatcher.pause(true);
            serverQueue.txtChannel
              .send(i18n.__mf("play.pauseSong", { author: user }))
              .catch(console.error);
          } else {
            serverQueue.playing = !serverQueue.playing;
            serverQueue.connection.dispatcher.resume();
            serverQueue.txtChannel
              .send(i18n.__mf("play.resumeSong", { author: user }))
              .catch(console.error);
          }
          break;

        case "🔇":
          reaction.users.remove(user).catch(console.error);
          if (!canModifyQueue(member)) return i18n.__("common.errorNotChannel");
          if (serverQueue.volume <= 0) {
            serverQueue.volume = 100;
            serverQueue.connection.dispatcher.setVolumeLogarithmic(100 / 100);
            serverQueue.txtChannel
              .send(i18n.__mf("play.unmutedSong", { author: user }))
              .catch(console.error);
          } else {
            serverQueue.volume = 0;
            serverQueue.connection.dispatcher.setVolumeLogarithmic(0);
            serverQueue.txtChannel
              .send(i18n.__mf("play.mutedSong", { author: user }))
              .catch(console.error);
          }
          break;

        case "🔉":
          reaction.users.remove(user).catch(console.error);
          if (serverQueue.volume == 0) return;
          if (!canModifyQueue(member)) return i18n.__("common.errorNotChannel");
          if (serverQueue.volume - 10 <= 0) serverQueue.volume = 0;
          else serverQueue.volume = serverQueue.volume - 10;
          serverQueue.connection.dispatcher.setVolumeLogarithmic(
            serverQueue.volume / 100
          );
          serverQueue.txtChannel
            .send(
              i18n.__mf("play.decreasedVolume", {
                author: user,
                volume: serverQueue.volume,
              })
            )
            .catch(console.error);
          break;

        case "🔊":
          reaction.users.remove(user).catch(console.error);
          if (serverQueue.volume == 100) return;
          if (!canModifyQueue(member)) return i18n.__("common.errorNotChannel");
          if (serverQueue.volume + 10 >= 100) serverQueue.volume = 100;
          else serverQueue.volume = serverQueue.volume + 10;
          serverQueue.connection.dispatcher.setVolumeLogarithmic(
            serverQueue.volume / 100
          );
          serverQueue.txtChannel
            .send(
              i18n.__mf("play.increasedVolume", {
                author: user,
                volume: serverQueue.volume,
              })
            )
            .catch(console.error);
          break;

        case "🔁":
          reaction.users.remove(user).catch(console.error);
          if (!canModifyQueue(member)) return i18n.__("common.errorNotChannel");
          serverQueue.loop = !serverQueue.loop;
          serverQueue.txtChannel
            .send(
              i18n.__mf("play.loopSong", {
                author: user,
                loop: serverQueue.loop
                  ? i18n.__("common.on")
                  : i18n.__("common.off"),
              })
            )
            .catch(console.error);
          break;

        case "⏹":
          reaction.users.remove(user).catch(console.error);
          if (!canModifyQueue(member)) return i18n.__("common.errorNotChannel");
          serverQueue.songs = [];
          serverQueue.txtChannel
            .send(i18n.__mf("play.stopSong", { author: user }))
            .catch(console.error);
          try {
            serverQueue.connection.dispatcher.end();
          } catch (error) {
            console.error(error);
            serverQueue.connection.disconnect();
          }
          collector.stop();
          break;

        default:
          reaction.users.remove(user).catch(console.error);
          break;
      }
    });

    collector.on("end", () => {
      playingMessage.reactions.removeAll().catch(console.error);
      if (PRUNING && playingMessage && !playingMessage.deleted) {
        playingMessage.delete({ timeout: 3000 }).catch(console.error);
      }
    });
  },
};
