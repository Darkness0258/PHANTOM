const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = 'C:\\workstation\\Apps\\Phantom\\apps\\phantom-mobile';
const config = getDefaultConfig(projectRoot);

config.projectRoot = projectRoot;
config.watchFolders = [projectRoot];

module.exports = config;