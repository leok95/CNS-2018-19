'use strict'

const express = require('express')
const router = express.Router()
const ecbController = rootrequire('controllers/ecb.controller')
const debug = require('debug')('oracle:routes')

router.post('/', ecbController.encrypt)
router.get('/challenge', ecbController.challenge)

module.exports = router
