if (process.env.NODE_ENV === 'production') {
  module.exports = {
    DEV_IGNORE_AUTH: false,
  };
} else {
  module.exports = {
    DEV_IGNORE_AUTH: true,
  };
}
