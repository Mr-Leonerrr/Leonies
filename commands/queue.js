module.exports = {
  name: 'queue',
  description: 'Show current playlist.',
  aliases: ['q'],
  group: 'music',
  memberName: 'queue',
  guildOnly: true,
  async execute(client, message, args, queue) {
    const serverQueue = queue.get(message.guild.id);

    if (!message.member.voice.channel) {
      return message.channel.send({
        embed: {
          title: 'Really?',
          description: 'You are not in the voice channel!',
          color: 16515072,
        },
      });
    }
    if (!serverQueue)
      return message.channel.send('There is no music currently playing!');

    let currentPage = 0;
    const embeds = generateQueueEmbed(serverQueue);

    const queueEmbed = await message.channel.send(
      `Current page: ${currentPage + 1}/${embeds.length}`,
      embeds[currentPage]
    );
    await queueEmbed.react('⬅️');
    await queueEmbed.react('➡️');

    const filter = (reaction, user) =>
      ['⬅️', '➡️'].includes(reaction.emoji.name) &&
      message.author.id === user.id;
    const collector = queueEmbed.createReactionCollector(filter);

    collector.on('collect', (reaction, user) => {
      if (reaction.emoji.name == '➡️') {
        if (currentPage < embeds.length - 1) {
          currentPage += 1;
          queueEmbed.edit(
            `Current page: ${currentPage + 1}/${embeds.length}`,
            embeds[currentPage]
          );
        }
      } else if (reaction.emoji.name == '⬅️') {
        if (currentPage !== 0) {
          currentPage -= 1;
          queueEmbed.edit(
            `Current page: ${currentPage + 1}/${embeds.length}`,
            embeds[currentPage]
          );
        }
      }
    });
    function generateQueueEmbed(serverQueue) {
      const embeds = [];
      let songs = 11;
      for (let i = 1; i < serverQueue.songs.length; i += 10) {
        const current = serverQueue.songs.slice(i++, songs);
        songs += 10;
        let j = i - 1;
        const info = current
          .map(
            (track) =>
              `${++j}. [${track.title}](${track.url}) | \`${track.duration}\``
          )
          .join('\n');

        let hasLoop = 'None';
        if (serverQueue.loopall) hasLoop = 'All';
        if (serverQueue.loopone) hasLoop = 'One';
        let embed = {
          embed: {
            title: 'Now Playing',
            thumbnail: {
              url: serverQueue.songs[0].thumbnail,
            },
            description: `[${serverQueue.songs[0].title}](${serverQueue.songs[0].url}) | \`${serverQueue.songs[0].duration}\`\n **Upnext** \n ${info}`,
            fields: [
              {
                name: 'Entries',
                value: `${serverQueue.songs.length} Songs`,
                inline: true,
              },
              {
                name: 'Loop',
                value: `${hasLoop}`,
                inline: true,
              },
            ],
          },
          color: 'RANDOM',
        };
        embeds.push(embed);
      }
      return embeds;
    }
  },
};
