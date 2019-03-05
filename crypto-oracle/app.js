'use strict'

const path = require('path');

global.__rootdir = __dirname; 
global.rootrequire = name => require(path.join(__rootdir, name));


const express = require('express');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const debug = require('debug')

const auth = rootrequire('security_modules/auth')
const config = rootrequire('config/config')
const index = rootrequire('routes/index')
const arp = rootrequire('routes/arp')
const ecb = rootrequire('routes/ecb')
const cbc = rootrequire('routes/cbc')
const ctr = rootrequire('routes/ctr')
const asymm = rootrequire('routes/asymm')

const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use(auth.authorizationParser({ API_KEY: config.API_KEY }))

app.use('/', index)
app.use('/arp', arp)
app.use('/ecb', ecb)
app.use('/cbc', cbc)
app.use('/ctr', ctr)
app.use('/asymm', asymm)

//---------------------------
// ERROR HANDLERS
//---------------------------
// Catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new Error('Not Found')
    err.code = 'ENOTFOUND'
    next(err)
})


// Ultimate error handler
const { ERRORS } = config

app.use((err, req, res, next) => {
    debug(`Requested path: ${req.path}`, 
          `Error code: ${err.code}`, 
          `Error: ${err.message}`)
        
    if (typeof ERRORS[err.code] === 'undefined') err.code = 'ESERVER'

    // Return json reponses for these reqests
    if (
        req.method === 'POST' || 
        req.xhr || 
        req.is('json')) {
        return res.json({ error: ERRORS[err.code] })
    }

    // Handle regular requests
    res.status(ERRORS[err.code].status || 500)
    const { title, message, status } = ERRORS[err.code]
    res.render('error', {title, message, status})    
})

module.exports = app
