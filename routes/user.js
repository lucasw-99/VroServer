const express = require('express');
const router = express.Router();
const passport = require('passport')

const user_controller = require('../controllers/user.controller');

/* POST register user */
router.post('/register', user_controller.register_user_post)

/* POST authenticate user with username & password, returns JWT */
router.post('/authenticate', user_controller.authenticate_user_post)

/* GET get user profile, authenticates with JWT */
router.get('/profile', passport.authenticate('jwt', { session: false }), user_controller.get_user)

/* GET get user events, authenticates with JWT */
router.get('/events', passport.authenticate('jwt', { session: false }), user_controller.get_user_events)

module.exports = router;
