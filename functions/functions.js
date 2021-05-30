const fs = require("fs");

module.exports = {
  loadCommands: function (client, dirName) {
    fs.readdir(dirName, (error, files) => {
      if (error) console.log(error);
      let jsFiles = files.filter((fl) => fl.split(".").pop() === "js");
      if (jsFiles.length <= 0) {
        console.log(`No commands to load in the folder: ${dirName.replace(/.\/commands\//gi, "")}`);
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
};
