module.exports = function (api) {
    api.cache(true);
    return {
      presets: ['babel-preset-expo'],
      plugins: [
        ['react-native-reanimated/plugin'], // si tu utilises Reanimated
        ['react-native-worklets-core/plugin'], // nécessaire pour Frame Processors
      ],
    };
  };