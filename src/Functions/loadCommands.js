const { glob } = require("glob");
const { Leonies } = require("../Client/Leonies");
const globPromise = require("util").promisify(glob);

/**
 * Load the commands files to the client
 * @param {Leonies} client
 */
module.exports = async (client) => {
  //Commands
  const commandFiles = await globPromise(`${process.cwd()}/Commands/**/*.js`);
  commandFiles.map((commandName) => {
    const command = require(commandName);
    const splitted = commandName.split("/");
    const folder = splitted[splitted.length - 2];

    if (command.name) {
      const props = { folder, ...command };
      client.commands.set(command.name, props);
    }
  });
};
