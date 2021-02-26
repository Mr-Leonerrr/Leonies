const ytdl = require("ytdl-core");
const ytpl = require("ytpl");
const { YTSearcher } = require("ytsearcher");

const searcher = new YTSearcher({
  key: process.env.YOUTUBE_API,
  revealed: true,
});

function timeFormat(duration) {
  let hrs = ~~(duration / 3600);
  let mins = ~~((duration % 3600) / 60);
  let secs = ~~duration % 60;

  let ret = "";

  if (hrs > 0) {
    ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
  }

  ret += "" + mins + ":" + (secs < 10 ? "0" : "");
  ret += "" + secs;
  return ret;
}

module.exports = {
  name: "play",
  description: "Play a song in your channel.",
  aliases: ["p", "pl"],
  usage: "[name song or url]",
  guildOnly: true,
  async execute(client, message, args, queue) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
      return message.channel.send({
        embed: {
          title: "Really?",
          description: "You are not in the voice channel!",
          color: 16515072,
        },
      });

    if (message.member.voice.deaf) {
      message.react("🔇");
      return message.reply({
        embed: {
          color: 16515072,
          description: "You can't run this command while deafened!",
        },
      });
    }

    if (args.length <= 0)
      return message.channel.send("Please provide name or link song!");

    let url = args.join("");
    if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
      try {
        await ytpl(url).then(async (playlist) => {
          message.channel.send(
            `The playlist: **${playlist.title}** has been queued.`
          );
          playlist.items.forEach(async (item) => {
            await videoHandler(
              await ytdl.getInfo(item.shortUrl),
              message,
              voiceChannel,
              true
            );
          });
        });
      } catch (error) {
        return message.channel.send(`Please insert a valid link...\n${error}`);
      }
    } else {
      let result = await searcher.search(args.join(" "), {
        type: "video",
      });
      if (result.first == null)
        return message.channel.send("There are no results found.");
      try {
        let songInfo = await ytdl.getInfo(result.first.url);
        return videoHandler(songInfo, message, voiceChannel);
      } catch (error) {
        message.channel.send(`Can't queue song ): \n ${error}`);
        console.log(error);
      }
    }

    async function videoHandler(
      songInfo,
      message,
      voiceChannel,
      playlist = false
    ) {
      const serverQueue = queue.get(message.guild.id);
      const song = {
        title: songInfo.videoDetails.title,
        url: songInfo.videoDetails.video_url,
        duration: timeFormat(songInfo.videoDetails.lengthSeconds),
        thumbnail: songInfo.videoDetails.thumbnails[3].url,
        requestBy: message.member.user,
      };

      if (!serverQueue) {
        const queueConstructor = {
          txtChannel: message.channel,
          vChannel: voiceChannel,
          connection: null,
          songs: [],
          volume: 100,
          playing: true,
          loopone: false,
          loopall: false,
          skipVotes: [],
        };

        queue.set(message.guild.id, queueConstructor);
        queueConstructor.songs.push(song);

        try {
          let connection = await voiceChannel.join();
          queueConstructor.connection = connection;
          message.guild.me.voice.setSelfDeaf(true);
          play(message.guild, queueConstructor.songs[0]);
        } catch (error) {
          console.error(error);
          queue.delete(message.guild.id);
          return message.channel.send(`Unable to join the voice chat ${error}`);
        }
      } else {
        serverQueue.songs.push(song);
        if (playlist) return undefined;

        return message.channel.send({
          embed: {
            title: "Queued",
            description: `[${song.title}](${song.url})`,
            color: 9437439,
            thumbnail: {
              url: song.thumbnail,
            },
            fields: [
              {
                name: "Song Duration",
                value: song.duration,
                inline: true,
              },
              {
                name: "Request by",
                value: song.requestBy,
                inline: true,
              },
            ],
          },
        });
      }
    }

    function play(guild, song) {
      const serverQueue = queue.get(guild.id);
      if (!song) {
        serverQueue.vChannel.leave();
        queue.delete(guild.id);
        return;
      }
      const dispatcher = serverQueue.connection
        .play(ytdl(song.url))
        .on("finish", () => {
          if (serverQueue.loopone) {
            play(guild, serverQueue.songs[0]);
          } else if (serverQueue.loopall) {
            serverQueue.songs.push(serverQueue.songs[0]);
            serverQueue.songs.shift();
          } else {
            serverQueue.songs.shift();
            play(guild, serverQueue.songs[0]);
          }
        });
      dispatcher.setVolumeLogarithmic(serverQueue.volume / 80);

      let nextSong;
      if (serverQueue.songs[1] != undefined)
        nextSong = serverQueue.songs[1].title;
      else nextSong = "None";

      serverQueue.txtChannel.send({
        embed: {
          title: "Now Playing",
          description: `[${song.title}](${song.url})`,
          thumbnail: {
            url: song.thumbnail,
          },
          color: 9437439,
          fields: [
            {
              name: "Duration",
              value: song.duration,
              inline: true,
            },
            {
              name: "Request By",
              value: `[${song.requestBy}]`,
              inline: true,
            },
          ],
          footer: { text: `Upnext: ${nextSong}` },
        },
      });
    }
  },
};
