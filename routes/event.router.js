const express = require('express');
const router = express.Router();
const passport = require('passport')

const event_controller = require('../controllers/event.controller');

/* POST post new event*/
router.post('/post', passport.authenticate('jwt', { session: false }), event_controller.postEvent)

/* DELETE deletes event with 'eventId' */
router.delete('/delete/:eventId', passport.authenticate('jwt', { session: false }), event_controller.deleteEvent)

module.exports = router;
