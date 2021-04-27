const { MessageEmbed: Embed } = require("discord.js");
const { play } = require("../../include/play");
const ytdl = require("discord-ytdl-core");
const YoutubeAPI = require("simple-youtube-api");
const { DEFAULT_VOLUME } = require("../../util/LeoncitoUtil");
const youtube = new YoutubeAPI(process.env.YOUTUBE_API);
const db = require("megadb");
let prefix_db = new db.crearDB("prefixes");
const { default_prefix } = require("../../config.json");
const i18n = require("i18n");
const timeFormat = require("../timeFormat");

module.exports = {
  name: "play",
  aliases: ["p"],
  description: i18n.__("play.description"),
  group: "Music",
  memberName: "Play",
  usage: "<name song or url>",
  args: true,
  cooldown: 3,
  guildOnly: true,
  callback: async (message, args) => {
    const serverQueue = message.client.queue.get(message.guild.id);
    let prefix = prefix_db.has(message.guild.id)
      ? await prefix_db.get(`${message.guild.id}.prefix`)
      : default_prefix;

    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply(i18n.__("play.errorNotChannel")).catch(console.error());

    if (serverQueue && voiceChannel !== message.guild.me.voice.channel) {
      return message
        .reply(i18n.__("play.errorNotInSameChannel", { user: message.client.user }))
        .catch(console.error());
    }
    if (message.member.voice.deaf) {
      message.react("🔇");
      return message.reply(
        new Embed().setColor(16515072).setDescription("You can't run this command while deafened!")
      );
    }

    if (!args.length) {
      return message.reply(i18n.__("play.usageReply", { prefix: prefix })).catch(console.error());
    }

    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT")) return message.reply(i18n.__("play.missingPermissionConnect"));
    if (!permissions.has("SPEAK")) return message.reply(i18n.__("play.missingPermissionSpeak"));

    const search = args.join(" ");
    const videoPattern = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi;
    const playlistPattern = /^.*(list=)([^#\&\?]*).*/gi;
    const url = args[0];
    const urlValid = videoPattern.test(args[0]);

    //Playlist
    if (!videoPattern.test(args[0]) && playlistPattern.test(args[0])) {
      return message.client.commands.get("playlist").callback(message, args);
    }

    const queueConstructor = {
      txtChannel: message.channel,
      voiceChannel,
      connection: null,
      songs: [],
      volume: 100,
      playing: true,
      loopone: false,
      loopall: false,
    };

    let songInfo = null;
    let song = null;

    if (urlValid) {
      try {
        songInfo = await ytdl.getInfo(url);
        song = {
          title: songInfo.videoDetails.title,
          url: songInfo.videoDetails.video_url,
          duration: timeFormat(songInfo.videoDetails.lengthSeconds),
          thumbnail: songInfo.videoDetails.thumbnails[3].url,
          requestBy: message.member.user,
        };
      } catch (error) {
        console.error(error);
        return message.reply(error.message).catch(console.error);
      }
    } else {
      try {
        const results = await youtube.searchVideos(search, 1, {
          part: "snippet",
        });
        songInfo = await ytdl.getInfo(results[0].url);
        song = {
          title: songInfo.videoDetails.title,
          url: songInfo.videoDetails.video_url,
          duration: timeFormat(songInfo.videoDetails.lengthSeconds),
          thumbnail: songInfo.videoDetails.thumbnails[3].url,
          requestBy: message.member.user,
        };
      } catch (error) {
        console.error(error);
        return message.reply(error.message).catch(console.error());
      }
    }

    if (serverQueue) {
      serverQueue.songs.push(song);
      return serverQueue.txtChannel
        .send(
          new Embed()
            .setDescription(
              i18n.__mf("play.queueAdded", {
                title: song.title,
                author: song.requestBy,
              })
            )
            .setColor("RANDOM")
        )
        .catch(console.error());
    }

    queueConstructor.songs.push(song);
    message.client.queue.set(message.guild.id, queueConstructor);

    try {
      queueConstructor.connection = await voiceChannel.join();
      await queueConstructor.connection.voice.setSelfDeaf(true);
      play(queueConstructor.songs[0], message);
    } catch (error) {
      console.error(error);
      message.client.queue.delete(message.guild.id);
      await voiceChannel.leave();
      return message.channel
        .send(i18n.__("play.cantJoinChannel", { error: error }))
        .catch(console.error());
    }
  },
};
