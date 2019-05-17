const mongoose = require('mongoose');
const validateProps = rootRequire('utils/validate.props');
const debug = require('debug')('express-web-app:db');

module.exports = options => {
    const { config } = options;
    validateProps([
        {name: 'uri'},
        {name: 'options'}
    ], config);

    mongoose.Promise = global.Promise;

    mongoose.connection.on('connected', function () {  
        debug(`Connected to DB at ${config.uri}.`);
    });

    // If the connection throws an error
    mongoose.connection.on('error',function (err) {
        debug(`Mongoose DB connection error ${err}.`);
    }); 

    // When the connection is disconnected
    mongoose.connection.on('disconnected', function () {  
        debug(`Connection to DB at ${config.uri} disconnected`); 
    });

    debug(`Connecting to DB at ${config.uri}`);
    return mongoose.connect(config.uri, config.options)
    .catch(err => {
        debug(`Failed to connect to DB at ${config.uri}.`);
        throw Error(err);
    });
};