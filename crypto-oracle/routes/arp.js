'use strict'

const express = require('express')
const router = express.Router()
const arpController = rootrequire('controllers/arp.controller')
const auth = rootrequire('security_modules/auth')
const debug = require('debug')('oracle:routes')

router.post('/', auth.authenticate, arpController.index)
router.get('/challenge', arpController.challenge)

module.exports = router
