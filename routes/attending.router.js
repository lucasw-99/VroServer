const express = require('express')
const router = express.Router()
const passport = require('passport')

const attendingController = require('../controllers/attending.controller')

/* GET get all events a user is attending */
router.get('/', passport.authenticate('jwt', { session: false }), attendingController.getUserEventsAttending)

/* PUT add userId to eventId's attending */
router.put('/:eventId', passport.authenticate('jwt', { session: false }), attendingController.attendEvent)

/* DELETE remove userId from eventId's attending */
router.delete('/:eventId', passport.authenticate('jwt', { session: false }), attendingController.unattendEvent)

module.exports = router;
