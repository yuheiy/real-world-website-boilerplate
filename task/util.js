const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const config = require('../realworld.config');

const isProd = process.argv[2] === 'build';

const basePath = config.basePath || '';
const baseUrl = config.baseUrl || 'http://example.com';

const destDir = isProd ? 'dist' : 'tmp';
const destBaseDir = path.join(destDir, basePath);
const destAssetsDir = path.join(destBaseDir, 'assets');

const readFileAsync = promisify(fs.readFile);

module.exports = {
    isProd,
    basePath,
    baseUrl,
    destDir,
    destBaseDir,
    destAssetsDir,
    readFileAsync,
};
