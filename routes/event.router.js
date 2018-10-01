const express = require('express');
const router = express.Router();
const passport = require('passport')

const event_controller = require('../controllers/event.controller');

/* GET get event with eventId */
router.get('/:eventId', passport.authenticate('jwt', { session: false }), event_controller.getEvent)

/* POST post new event*/
router.post('/post', passport.authenticate('jwt', { session: false }), event_controller.postEvent)

/* DELETE deletes event with 'eventId' */
router.delete('/:eventId', passport.authenticate('jwt', { session: false }), event_controller.deleteEvent)

module.exports = router;
