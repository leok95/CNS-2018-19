'use strict'

const express = require('express')
const router = express.Router()
const ctrController = rootrequire('controllers/ctr.controller')
const debug = require('debug')('oracle:routes')

router.post('/', ctrController.encrypt)
router.get('/challenge', ctrController.challenge)

module.exports = router
