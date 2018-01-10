const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const config = require('../config');
const chalk = require('chalk');

/**
 * Builds a zip based on an array of directories and files. This
 * script is used for shipit and should not be called explicitly.
 */

const zipName = fs.existsSync(config.paths.packageJson)
  ? require(config.paths.packageJson).name
  : 'theme-zip';
const zipPath = getZipPath(config.paths.root, zipName, 'zip');
const output = fs.createWriteStream(zipPath);
const archive = archiver('zip');

if (!fs.existsSync(config.paths.dist)) {
  console.log(
    chalk.red(
      `${config.paths.dist} was not found. \n` +
        'Please run the Slate Build script before running Slate Zip'
    )
  );

  process.exit();
}

output.on('close', () => {
  console.log(`${path.basename(zipPath)}: ${archive.pointer()} total bytes`);
});

archive.on('warning', function(err) {
  if (err.code === 'ENOENT') {
    console.log(err);
  } else {
    throw err;
  }
});

archive.on('error', err => {
  throw err;
});

archive.pipe(output);
archive.directory(config.paths.dist, '/');
archive.finalize();

function getZipPath(dir, name, ext) {
  const proposedPath = path.resolve(dir, `${name}.${ext}`);
  if (!fs.existsSync(proposedPath)) {
    return proposedPath;
  }

  for (let i = 1; ; i++) {
    let tryPath = path.resolve(dir, `${name} (${i}).${ext}`);

    if (!fs.existsSync(tryPath)) {
      return tryPath;
    }
  }
}
