const { join } = require("path");
const filePath = join(__dirname, "..", "commands");

const functions = require("../functions/functions");

module.exports.run = (client) => {
  functions.loadCommands(client, `${filePath}/Admin/`);
  functions.loadCommands(client, `${filePath}/Music/`);
  functions.loadCommands(client, `${filePath}/Util/`);
};
