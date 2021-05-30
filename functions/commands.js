const { join } = require("path");
const filePath = join(__dirname, "..", "Commands");

const functions = require("./functions");

module.exports.run = (client) => {
  functions.loadCommands(client, `${filePath}/Fun/`);
  functions.loadCommands(client, `${filePath}/Guild/`);
  functions.loadCommands(client, `${filePath}/Moderation/`);
  functions.loadCommands(client, `${filePath}/Music/`);
  functions.loadCommands(client, `${filePath}/Owner/`);
  functions.loadCommands(client, `${filePath}/Util/`);
};
