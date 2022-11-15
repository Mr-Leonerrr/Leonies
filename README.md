----  
# ⚠️ Deprecated Warning
This version of the code is intended to work with discord.js v12.x.  
Currently, the package is at v14.x. If you wish to continue using this module, please note this requirement.  
We will be working on a new version to use the latest versions of discord.js.

----  

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/S6S33RM7Z)

# 🦁 Leonies

> Leonies is a Discord Music Bot equipped with the basics for moderation, fun and entertainment built
> with [discord.js](https://discord.js.org/#/docs/)

# Requirements

1. Discord Bot Token
   [Guide](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)
2. Youtube Data API v3 Key [Guide](https://developers.google.com/youtube/v3/getting-started)
3. Genius API Client Management [Guide](https://docs.genius.com/#/getting-started)
4. [Node.js](https://nodejs.org/es/) v14.0.0 or newer

# Configure your KEY or TOKEN

Create a file called `.env` within your project folder. It will have this syntax:

```json
TOKEN="DISCORD_BOT_TOKEN"
YOUTUBE_API="YOUTUBE_API_KEY"
GENIUS_TOKEN="CLIENT_ACCESS_TOKEN"
```

# How to Use config.json

In the file called `config.json` replace the values according to your criteria

```json
{
  "prefix": ";",
  "support": {
    "invite": "server-invitation",
    "id": "server-id",
    "logs": "logs-channel-id"
  },
  "owner": {
    "id": "user-id",
    "name": "username#tag"
  }
}
```

# 📝 Features & Commands

> Note: The default prefix is ';'

• 🎵 Play music from Youtube via URL <br/> `;play https://youtu.be/0CNPR2qNzxk`

• 🔎 Search music from Youtube via search query <br/> `;play Welcome to the jungle guns and rouses`

• 🔎 Play Youtube playlists via URL <br/>
`;play https://www.youtube.com/playlist?list=PLofmCZWRdOtl1dM2XQPx2_8KxveP6KbTt`

• Now Playing `;np` <br/> • Queue `;queue` or `;q`<br/> • Loop / Repeat `;loop`, `;lp` <br/> • Volume
control `;volume`, `;vol` <br/> • Lyrics `;lyrics`, `;ly` <br/> • Pause `;pause` <br/> • Resume
`;resume`, `;r`, `;continue` <br/> • Stop and clear the queue `;stop`, `;sp` <br/> • Skip `;skip`, `;sk`
<br/> • Remove `;remove`, `;rm` <br/> • Show API ping `;ping` <br/> • Help `;help` `;commands`

# 📬 Support

• Message me on discord: [Leoner#1111](https://discord.com/users/445403516970729482) <br/> • Join the
[discord server](https://discord.gg/uJguFNpkWU) <br/> • Create a issue on the
[github](https://github.com/Mr-Leonerrr/Leonies/issues)

# 🤝 Contributing

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/Leonies.git`
3. Create your feature branch: `git checkout -b my-new-feature`
4. Commit your changes: `git commit -am 'Add some feature'`
5. Push to the branch: `git push origin my-new-feature`
6. Submit a pull request
