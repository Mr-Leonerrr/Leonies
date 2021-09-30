const { glob } = require("glob");
const globPromise = require("util").promisify(glob);

module.exports.run = async () => {
  const eventFiles = await globPromise(`${process.cwd()}/src/Events/*.js`);
  eventFiles.map((event) => require(event));

  console.log(`Loaded ${eventFiles.length} events!`);
};
