const debug = require('debug')('auto-index')
const utils = require('./utils')
const findMagnetLinks = require('./find-magnet-links').findMagnetLinks;

module.exports = (tvshowsPath) => {
  debug(`Scanning TV shows directory "${tvshowsPath}" for missing episodes..`)
  const shows = utils.getSubDirectories(tvshowsPath)
  debug(`Found ${shows.length} TV shows`)
  shows.forEach((showDir) => findMagnetLinks(`${tvshowsPath}${showDir}`))
};
