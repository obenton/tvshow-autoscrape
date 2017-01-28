const fs = require('fs')
const path = require('path')

function getFiles (dir) {
  return fs.readdirSync(dir).filter((fileOrDir) => {
    const fileOrDirPath = path.join(dir, fileOrDir)
    return fs.statSync(fileOrDirPath).isFile()
  })
}

function getSubDirectories (dir) {
  return fs.readdirSync(dir).filter((fileOrDir) => {
    const fileOrDirPath = path.join(dir, fileOrDir)
    return fs.statSync(fileOrDirPath).isDirectory()
  })
}

module.exports = {
  getFiles: getFiles,
  getSubDirectories: getSubDirectories
}
