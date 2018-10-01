const express = require('express');
const router = express.Router();
const passport = require('passport')

const timelineController = require('../controllers/timeline.controller');

/* GET gets a users timeline */
router.get('/', passport.authenticate('jwt', { session: false }), timelineController.getTimeline)

module.exports = router;
