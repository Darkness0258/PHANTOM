const { getDefaultConfig } = require('./apps/phantom-mobile/node_modules/expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const mobileRoot = path.join(__dirname, 'apps/phantom-mobile');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [projectRoot, mobileRoot];
config.resolver = {
    ...config.resolver,
    nodeModulesPaths: [
        path.join(mobileRoot, 'node_modules'),
    ],
};

module.exports = config;