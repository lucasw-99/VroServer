const express = require('express')
const router = express.Router()
const passport = require('passport')

const followController = require('../controllers/follow.controller')

/* GET get all user followers */
router.get('/', passport.authenticate('jwt', {session: false}), followController.userFollowersGet)

/* PUT add newFollowerId to userId's followers */
router.put('/:newFollowerId', passport.authenticate('jwt', {session: false}), followController.addFollower)

/* DELETE remove newFollowerId to userId's followers */
router.delete('/:removeFollowerId', passport.authenticate('jwt', {session: false}), followController.removeFollower)

module.exports = router;
