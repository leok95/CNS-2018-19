'use strict'

const express = require('express')
const router = express.Router()
const asymmController = rootrequire('controllers/asymm.controller')
const debug = require('debug')('oracle:routes')

router.get('/rsa/server', asymmController.serverRSA)
router.post('/rsa/client', asymmController.clientRSA)
router.post('/dh/client', asymmController.clientDH)
router.get('/challenge', asymmController.challenge)

module.exports = router