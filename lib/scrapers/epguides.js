const debug = require('debug')('epguides-scraper')
const moment = require('moment')
const Horseman = require('node-horseman')

/*
 * Remove all spaces and "'" from show name.
 * Remove ', The' suffix.
 */
function _slugifyShowName (showName) {
  return showName.replace(', The', '').replace(/\s+/g, '').replace("'", '')
}

/*
 * epguides url: http://epguides.com/NewGirl/
 */
async function getEpisodeList (showName) {
  const url = `http://epguides.com/${_slugifyShowName(showName)}/`
  let html
  await new Horseman()
    .open(url)
    .evaluate(function() {
      return $('#eplist').html()
    })
    .then((eplistHtml) => {
      html = eplistHtml
    })
    .close()
  return html
}

/*
 * Parse html from epguides episode list for episode details.
 *
 * Example: For the given line:
 * '117.   6-1  20 Sep 16   <a href="http://.../new-girl-6x01-house-hunt">House Hunt</a>'
 *
 * We create an object of the following structure:
 * {
 *   season: 6,
 *   episode: 1,
 *   day: '20',
 *   month: 'Sep',
 *   year: '2016'
 * }
 *
 * @return Array of episode details
 */
function parseEpisodeList (episodeListHtml) {
  const lines = episodeListHtml.split('\n')
  const pattern = /^[0-9]+\.\s+([0-9]+)-([0-9]+)\s+([0-9]+) ([a-zA-Z]{3}) ([0-9]+).+$/

  const parseLine = (episodes, line) => {
    const matches = line.match(pattern)
    if (matches && matches.length === 6) {
      const details = {
        season: parseInt(matches[1]),
        episode: parseInt(matches[2]),
        day: matches[3],
        month: matches[4],
        year: `20${matches[5]}` // warning: shows from the 1990's and older would be placed in the next century here!
      }
      return episodes.concat([details])
    } else {
      return episodes
    }
  }

  return lines.reduce(parseLine, [])
}

async function findMissingAiredEpisodes(show, season, episode) {
  const html = await getEpisodeList(show)
  const episodes = parseEpisodeList(html)
  debug(`Found ${episodes.length} episodes on epguides.com`)

  let sameSeason
  const missingEpisodes = episodes.filter((episodeDetails) => {
    sameSeason = episodeDetails.season === season;
    return episodeDetails.season > season || (sameSeason && episodeDetails.episode > episode)
  })
  debug('Missing episodes:', missingEpisodes)

  const today = moment()
  debug(`today: ${today.format()}`)
  let aired
  const missingAiredEpisodes = missingEpisodes.filter((episode) => {
    aired = moment()
    aired.set('year', episode.year)
    aired.set('month', episode.month)
    aired.set('date', episode.day)
    debug(`Season ${episode.season} Episode ${episode.episode} airs on ${aired.format()}`)
    return aired.isBefore(today)
  })
  debug('Missing, already aired episodes:', missingAiredEpisodes)

  return missingAiredEpisodes
}

module.exports = {
  findMissingAiredEpisodes: findMissingAiredEpisodes
}
