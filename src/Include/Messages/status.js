const { MessageEmbed } = require("discord.js");

/**
 * Send success embed
 * @param {String} args
 * @return {MessageEmbed}
 */
const success = (args) => {
  return new MessageEmbed().setDescription(`:white_check_mark: ${args}`).setColor("GREEN");
};

/**
 * Send error embed
 * @param {String} args
 * @return {MessageEmbed}
 */
const error = (args) => {
  return new MessageEmbed().setDescription(`:no_entry: ${args}`).setColor("RED");
};

module.exports = { success, error };
