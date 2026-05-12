const path = require('path');
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const projectRoot = __dirname;
const projectNodeModules = path.resolve(projectRoot, 'node_modules');

module.exports = mergeConfig(getDefaultConfig(projectRoot), {
  projectRoot,
  resolver: {
    nodeModulesPaths: [
      projectNodeModules
    ],
    extraNodeModules: {
      react: path.resolve(projectNodeModules, 'react'),
      'react-native': path.resolve(projectNodeModules, 'react-native'),
      'react-native-safe-area-context': path.resolve(projectNodeModules, 'react-native-safe-area-context'),
      'react-native-screens': path.resolve(projectNodeModules, 'react-native-screens'),
      'react-native-gesture-handler': path.resolve(projectNodeModules, 'react-native-gesture-handler'),
      'react-native-reanimated': path.resolve(projectNodeModules, 'react-native-reanimated'),
      '@react-native-async-storage/async-storage': path.resolve(projectNodeModules, '@react-native-async-storage/async-storage'),
      '@react-navigation/elements': path.resolve(projectNodeModules, '@react-navigation/elements'),
      '@react-navigation/native': path.resolve(projectNodeModules, '@react-navigation/native'),
      '@react-navigation/native-stack': path.resolve(projectNodeModules, '@react-navigation/native-stack'),
      '@react-navigation/bottom-tabs': path.resolve(projectNodeModules, '@react-navigation/bottom-tabs')
    },
    disableHierarchicalLookup: true
  }
});
