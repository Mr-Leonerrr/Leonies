const Discord = require("discord.js");
const fs = require("fs");

module.exports = {
  loadCommands: function (client, dirName) {
    fs.readdir(dirName, (error, files) => {
      if (error) console.log(error);
      let jsFiles = files.filter((fl) => fl.split(".").pop() === "js");
      if (jsFiles.length <= 0) {
        console.log(`No commands to load in the folder: ${dirname.replace(/.\/commands\//gi, "")}`);
        return;
      }

      jsFiles.forEach((fl, i) => {
        delete require.cache[require.resolve(`${dirName}${fl}`)];
        let props = require(`${dirName}${fl}`);
        client.commands.set(props.name, props);

        if (props.aliases)
          for (const alias of props.aliases) {
            client.aliases.set(alias, props);
          }
      });
    });
  },

  //EMBED SUCCESS & ERROR
  errorEmbed: function (message, channel, args) {
    channel.send(new Discord.MessageEmbed().setDescription(`📛 **Error:** ${args} 📛`).setColor("RED"));
  },

  successEmbed: function (message, channel, args) {
    channel.send(new Discord.MessageEmbed().setDescription(`✅ **Success:** ${args}`).setColor("GREEN"));
  },
};
