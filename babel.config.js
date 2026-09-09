module.exports = function(api) {
  api.cache(true);
  return {
    // babel-preset-expo (SDK 57) automatically applies react-native-worklets/plugin,
    // which replaced react-native-reanimated/plugin in Reanimated 4.
    presets: ['babel-preset-expo'],
  };
};
