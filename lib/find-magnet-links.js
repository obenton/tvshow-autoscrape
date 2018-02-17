const path = require('path')
const debug = require('debug')('cli')
const child_process = require('child_process')
const localEpisodes = require('./local-episodes')
const epguidesScraper = require('./scrapers/epguides')
const piratebayScraper = require('./scrapers/piratebay')

async function findMagnetLinks (pathToShow) {
  const showName = path.basename(pathToShow)

  debug(`Finding latest local episode for "${showName}"`)
  const [season, episode] = localEpisodes.findLatest(pathToShow)

  debug('Getting episode list for', showName)
  const missingAiredEpisodes = await epguidesScraper.findMissingAiredEpisodes(showName, season, episode)

  if (missingAiredEpisodes.length === 0) {
    debug(`All aired episodes of "${showName}" have been found locally. Nothing to do.`)
    process.exit(0)
  }

  debug('Getting magnet links for', showName)
  const magnetLinks = await piratebayScraper.getMagnetLinksForEpisodes(showName, missingAiredEpisodes)

  debug(`Launching Transmission with ${magnetLinks.length} magnet links`)
  for (let link of magnetLinks) {
    const command = `open /Applications/Transmission.app/ "${link}"`
    child_process.execSync(command)
  }
}

module.exports = { findMagnetLinks: findMagnetLinks }
