'use strict'

const express = require('express')
const router = express.Router()
const view = rootrequire('config/config').VIEW;

router.get('/', (req, res, next) => {
  res.render('index', view.index)
})

module.exports = router
