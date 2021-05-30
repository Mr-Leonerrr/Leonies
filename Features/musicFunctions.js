const getArtistTitle = require("get-artist-title");

module.exports.timeFormat = (duration) => {
  let hrs = ~~(duration / 3600);
  let mins = ~~((duration % 3600) / 60);
  let secs = ~~duration % 60;

  let ret = "";

  if (hrs > 0) {
    ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
  }

  ret += "" + mins + ":" + (secs < 10 ? "0" : "");
  ret += "" + secs;
  return ret;
};

module.exports.createQuery = (args) => {
  const query = ([artist, title] = getArtistTitle(args, {
    defaultArtist: " ",
  }));
  return query;
};
