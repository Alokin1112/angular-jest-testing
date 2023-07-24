// karma.conf.js
module.exports = function (config) {
  config.set({
    browsers: ['Brave'],
    client: {
      jasmine: {
        random: false
      }
    }
  });
};