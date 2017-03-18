const debug = require('debug')('unbox')
const utils = require('./utils')

const unbox = (tvshowsPath, showDir) => {
    const path = `${tvshowsPath}${showDir}`
    debug(`Looking for unboxed downloads in ${path}`);

    console.log(utils.getSubDirectories(path))

    // TODO: find season subfolders
    // TODO: for each season subfolder, find sub-directories inside it
    // TODO: for each subdirectoy, test if it matches the criteria of an unboxed download
    // TODO: if it's an unboxed download, find the largest video file that passes the test
    // TODO: if video file found, move it up one level and delete the folder
    // TODO: report what has been moved and deleted
}

module.exports = (tvshowsPath) => {
    debug(`Scanning TV shows directory "${tvshowsPath}" for downloads to unbox..`)
    const shows = utils.getSubDirectories(tvshowsPath)
    debug(`Found ${shows.length} TV shows`)
    shows.forEach((showDir) => {
        // TODO: run for all shows
        if (showDir === 'New Girl') {
            unbox(tvshowsPath, showDir)
        }
    });
};
