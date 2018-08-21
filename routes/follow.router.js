const express = require('express')
const router = express.Router()
const passport = require('passport')

const followController = require('../controllers/follow.controller')

/* GET get all user followers */
router.get('/:userId', passport.authenticate('jwt', {session: false}), followController.userFollowersGet)

/* POST add newFollowerId to userId's followers */
router.post('/:userId/newFollower/:newFollowerId', passport.authenticate('jwt', {session: false}), followController.addFollower)

/* DELETE remove newFollowerId to userId's followers */
router.delete('/:userId/removeFollower/:newFollowerId', passport.authenticate('jwt', {session: false}), followController.removeFollower)

module.exports = router;
