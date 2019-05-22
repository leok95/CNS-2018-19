const mongoose = require("mongoose");
const validateProps = rootRequire("utils/validate.props");
const debug = require("debug")("express-web-app:db");

module.exports = options => {
  const { config } = options;
  validateProps([{ name: "uri" }, { name: "options" }], config);
  mongoose.Promise = global.Promise;

  const connect = () => {
    debug(`\nConnecting to DB at ${config.uri}`);
    return mongoose.connect(config.uri, config.options).catch(err => {
      debug(`Failed to connect to DB at ${config.uri}.`);
    });
  };

  mongoose.connection.on("connected", function() {
    debug(`Connected to DB at ${config.uri}.`);
  });

  mongoose.connection.on("error", function(err) {
    debug(`${err}.`);
  });

  mongoose.connection.on("disconnected", function() {
    debug(`Connection to DB at ${config.uri} disconnected`);
    setTimeout(() => connect(), config.reconnectAfter);
  });

  process.on("SIGINT", () => {
    mongoose.connection.close(() => {
      debug(`Mongoose connection disconnected `);
      process.exit(0);
    });
  });

  return connect();
};
