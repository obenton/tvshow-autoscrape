const path = require('path')
const debug = require('debug')('local-episodes')
const utils = require('./utils')

const constants = require('./constants')

function _findLatestSeason (pathToShow) {
  const seasons = utils.getSubDirectories(pathToShow).filter((dir) => constants.seasonDirRegex.test(dir))

  let matches, num
  const highestSeason = (max, curr) => {
    matches = curr.match(constants.seasonDirRegex)
    if (matches && matches.length === 2) {
      num = parseInt(matches[1])
      max = num > max ? num : max
    }
    return max
  }

  return seasons.reduce(highestSeason, 0)
}

function _findLatestEpisodeForSeason (pathToShow, seasonName) {
  const seasonPath = path.join(pathToShow, seasonName)
  const files = utils.getFiles(seasonPath).filter((file) => constants.episodeFileRegex.test(file))

  let matches, num
  const highestEpisode = (max, curr) => {
    matches = curr.match(constants.episodeFileRegex)
    if (matches && matches.length === 2) {
      num = parseInt(matches[1])
      max = num > max ? num : max
    }
    return max
  }

  return files.reduce(highestEpisode, 0)
}

function findLatest (pathToShow) {
  const latestSeason = _findLatestSeason(pathToShow)
  debug(`Latest season: ${latestSeason}`)

  // Handle empty show directory (contains no season directories)
  if (latestSeason === 0) {
    return [0, 0];
  }

  const latestEpisode = _findLatestEpisodeForSeason(pathToShow, `Season ${latestSeason}`)
  debug(`Latest episode: ${latestEpisode}`)

  return [latestSeason, latestEpisode]
}

module.exports = {
  findLatest: findLatest
}