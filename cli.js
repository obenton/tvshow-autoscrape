const fs = require('fs')
const path = require('path')
const debug = require('debug')('cli')
const child_process = require('child_process')
const localEpisodes = require('./lib/local-episodes')
const epguidesScraper = require('./lib/scrapers/epguides')
const piratebayScraper = require('./lib/scrapers/piratebay')

async function getMagnetLinksAndLaunchTransmission (pathToShow) {
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

if (process.argv.length >= 3) {
  const pathToShow = process.argv[2]
  if (fs.existsSync(pathToShow)) {
    getMagnetLinksAndLaunchTransmission(pathToShow)
  } else {
    console.log(`Directory not found: ${pathToShow}`)
  }
} else {
  console.log('Usage: npm start /path/to/tv/show')
}
