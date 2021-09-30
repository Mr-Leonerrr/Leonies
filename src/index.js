const { Leonies } = require("./Client/Leonies");
const client = new Leonies("client-options");
module.exports = client;

client.init().then(() => client.isReady());
