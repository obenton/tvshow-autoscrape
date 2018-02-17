const fs = require('fs')
const findMagnetLinks = require('./lib/find-magnet-links').findMagnetLinks
const unbox = require('./lib/unbox');
const autoIndex = require('./lib/auto-index');

const modes = new Set(['-u', '-a']);

if (process.argv.length >= 3) {
  const mode = process.argv[2];
  if (modes.has(mode)) {
    // Unbox or auto-indexing mode. Expect path to all tv shows as second param.
    if (process.argv.length >= 4) {
      const tvshowsPath = process.argv[3];
      if (mode === '-u') {
        unbox(tvshowsPath);
      }
      if (mode === '-a') {
        autoIndex(tvshowsPath)
      }
    } else {
      console.log('Usage for unbox mode: npm run unbox /path/to/all/tvshows/')
      console.log('Usage for auto-indexing mode: npm run auto /path/to/all/tvshows/')
    }
  } else {
    // Download mode. Expect path to tv show as second param.
    const pathToShow = process.argv[2]
    if (fs.existsSync(pathToShow)) {
      findMagnetLinks(pathToShow)
    } else {
      console.log(`Directory not found: ${pathToShow}`)
    }
  }
} else {
  console.log('Usage: npm start /path/to/tv/show')
}
