'use strict'

const express = require('express')
const router = express.Router()
const cbcController = rootrequire('controllers/cbc.controller')
const debug = require('debug')('oracle:routes')

router.post('/', cbcController.index)
router.post('/iv', cbcController.predictableiv.encrypt)
router.get('/iv/challenge', cbcController.predictableiv.challenge)

module.exports = router
