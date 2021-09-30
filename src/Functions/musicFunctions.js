const getArtistTitle = require("get-artist-title");

module.exports.createQuery = (args) => {
  return ([artist, title] = getArtistTitle(args, {
    defaultArtist: " ",
  }));
};
