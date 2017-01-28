const debug = require('debug')('piratebay-scraper')
const Horseman = require('node-horseman')

function _pad (num) {
  return num < 10 ? `0${num}` : `${num}`
}

/*
 * Remove all spaces and "'" from show name.
 * Remove ', The' suffix.
 */
function _slugifyShowName (showName) {
    return showName.replace("'", '')
}

async function getMagnetLinksForEpisodes (show, episodes) {
  const magnetLinks = []

  let query, url
  for (let {season, episode} of episodes) {
    query = `${_slugifyShowName(show)} S${_pad(season)}E${_pad(episode)} 720p`
    url = `https://thepiratebay.org/search/${encodeURIComponent(query)}`
    debug(`Scraping torrents from ${url}`)
    await new Horseman()
      .open(url)
      .evaluate(function findMagnetLink () {
        var row = $('#SearchResults table tr:not(.header)').first()
        var cells = $(row).find('td')
        var $cell = $(cells[1])
        return $cell.find('a[href^="magnet"]').attr('href')
      })
      .then((magnetLink) => {
        debug(`Magnet link found: ${magnetLink}`)
        magnetLinks.push(magnetLink)
      })
      .close()
  }

  return magnetLinks
}

module.exports = {
  getMagnetLinksForEpisodes: getMagnetLinksForEpisodes
}
