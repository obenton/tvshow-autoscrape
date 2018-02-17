const debug = require('debug')('unbox')
const path = require('path')
const fs = require('fs')
const exec = require('child_process').exec;
const utils = require('./utils')
const constants = require('./constants')

const VIDEO_FILE_EXTENSIONS = new Set(['avi', 'mkv'])
const VIDEO_FILE_MIN_SIZE = 31457280 // 30 mb
const TRASH_PATH = '~/.Trash'

const isVideoFile = (filename) => {
  const extension = filename.split('.').pop()
  return VIDEO_FILE_EXTENSIONS.has(extension)
}

const unbox = (tvshowsPath, showDir) => {
    const path = `${tvshowsPath}${showDir}`
    debug(`Looking for downloads to unbox in ${path}`);

    const seasons = utils.getSubDirectories(path).filter(dir => constants.seasonDirRegex.test(dir));

    let seasonPath, downloadPath, videoFilePath, videoFileStats;
    seasons.forEach(season => {
      seasonPath = `${path}/${season}`
      utils.getSubDirectories(seasonPath).forEach(subdir => {
        downloadPath = `${seasonPath}/${subdir}`
        utils.getFiles(downloadPath).filter(isVideoFile).forEach(file => {
          videoFilePath = `${downloadPath}/${file}`
          videoFileStats = fs.statSync(videoFilePath)
          if (videoFileStats.size >= VIDEO_FILE_MIN_SIZE) {
            debug(`Unboxing video file: ${videoFilePath}`);
            exec(`mv "${videoFilePath}" "${seasonPath}"`, error => {
              if (error === null) {
                debug(`Moving download folder to trash: ${downloadPath}`)
                exec(`mv "${downloadPath}" ${TRASH_PATH}`, error => {
                  if (error !== null) {
                    debug(`Error moving download folder "${downloadPath}" to trash: ${error}`)
                  }
                })
              } else {
                debug(`Error moving video file to "${seasonPath}": ${error}`)
              }
            })
          }
        })
      })
    })
}

module.exports = (tvshowsPath) => {
  debug(`Scanning TV shows directory "${tvshowsPath}" for downloads to unbox..`)
  const shows = utils.getSubDirectories(tvshowsPath)
  debug(`Found ${shows.length} TV shows`)
  shows.forEach((showDir) => unbox(tvshowsPath, showDir))
};
