const { Message, MessageEmbed: Embed } = require("discord.js");
const { play } = require("../../include/play");
const { playlist } = require("../../include/playlist");
const ytdl = require("discord-ytdl-core");
const { YTSearcher } = require("ytsearcher");
const youtube = new YTSearcher({ key: process.env.YOUTUBE_API, revealKey: true });
const { timeFormat, createQuery } = require("../../Features/musicFunctions");

module.exports = {
  name: "play",
  aliases: ["p"],
  description: "Plays audio from Youtube",
  usage: "<name song | url | playlist url>",
  group: "Music",
  memberName: "Play",
  args: true,
  guildOnly: true,
  cooldown: 3,
  /**
   * @param {Message} message
   * @param {String[]} args
   */
  callback: async (message, args) => {
    const { client, guild, channel, member } = message;
    const serverQueue = client.queue.get(guild.id);

    const voiceChannel = member.voice.channel;
    if (!voiceChannel) {
      return message.inlineReply(
        new Embed().setDescription("You need to join a voice channel first!").setColor("RED")
      );
    }

    if (serverQueue && voiceChannel !== guild.me.voice.channel) {
      return message
        .inlineReply(`You must be in the same channel as ${message.client.user}`)
        .catch((error) => console.error(error));
    }

    if (member.voice.deaf) {
      message.react("🔇");
      return message.inlineReply(
        new Embed().setDescription("You can't run this command while deafened!").setColor("RED")
      );
    }

    const permissions = voiceChannel.permissionsFor(client.user);
    if (!permissions.has("CONNECT"))
      return channel.inlineReply(
        new Embed()
          .setDescription(":x: I couldn't connect to the voice channel, missing permissions.")
          .setColor("RED")
      );
    if (!permissions.has("SPEAK"))
      return channel.inlineReply(
        new Embed()
          .setDescription(
            ":x: I can't speak in this voice channel, make sure I've the proper permissions!"
          )
          .setColor("RED")
      );

    const search = args.join(" ");
    const videoPattern = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi;
    const playlistPattern = /^.*(list=)([^#\&\?]*).*/gi;
    const url = args[0];
    const urlValid = videoPattern.test(url);

    //Playlist
    if (!videoPattern.test(url) && playlistPattern.test(url)) {
      return playlist(message, args);
    }

    const queueConstructor = {
      txtChannel: channel,
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
        const getInfo = createQuery(songInfo.videoDetails.title);
        let thumbnail;
        if (songInfo.videoDetails.thumbnails[4] == undefined)
          thumbnail = songInfo.videoDetails.thumbnails[3].url;
        else thumbnail = songInfo.videoDetails.thumbnails[4].url;
        song = {
          title: getInfo[1],
          artist: getInfo[0],
          fullTitle: songInfo.videoDetails.title,
          url: songInfo.videoDetails.video_url,
          duration: timeFormat(songInfo.videoDetails.lengthSeconds),
          thumbnail: thumbnail,
          requestBy: member.user,
        };
      } catch (error) {
        console.error(error);
        return message.reply(error.message).catch((error) => console.error(error));
      }
    } else {
      try {
        const results = await youtube.search(search, { part: "video" });
        if (results.first === null) {
          return message.inlineReply(
            new Embed().setDescription("No results found.").setColor("ORANGE")
          );
        }

        songInfo = await ytdl.getInfo(results.first.url);
        const getInfo = createQuery(songInfo.videoDetails.title);
        let thumbnail;
        if (songInfo.videoDetails.thumbnails[4] == undefined)
          thumbnail = songInfo.videoDetails.thumbnails[3].url;
        else thumbnail = songInfo.videoDetails.thumbnails[4].url;
        song = {
          title: getInfo[1],
          artist: getInfo[0],
          fullTitle: songInfo.videoDetails.title,
          url: songInfo.videoDetails.video_url,
          duration: timeFormat(songInfo.videoDetails.lengthSeconds),
          thumbnail: thumbnail,
          requestBy: member.user,
        };
      } catch (error) {
        console.error(error);
        return message.reply(error.message).catch((error) => console.error(error));
      }
    }

    if (serverQueue) {
      serverQueue.songs.push(song);
      return serverQueue.txtChannel
        .send(
          new Embed()
            .setDescription(`✅ **Queued** [${song.fullTitle}](${song.url})`)
            .addField("Requested by", song.requestBy, true)
            .setColor("GREEN")
            .setFooter(`Queue position: ${serverQueue.songs.lastIndexOf(song) + 1}`)
        )
        .catch((error) => console.error(error));
    }

    queueConstructor.songs.push(song);
    client.queue.set(guild.id, queueConstructor);

    try {
      queueConstructor.connection = await voiceChannel.join();
      await queueConstructor.connection.voice.setSelfDeaf(true);
      play(queueConstructor.songs[0], message);
    } catch (error) {
      console.error(error);
      client.queue.delete(guild.id);
      await voiceChannel.leave();
      return channel
        .send(
          new Embed()
            .setDescription(`I Couldn't join to the voice channel: ${error}`)
            .setColor("RED")
        )
        .catch((error) => console.error(error));
    }
  },
};
