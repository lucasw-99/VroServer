const express = require('express')
const router = express.Router()
const passport = require('passport')

const likeController = require('../controllers/like.controller')

/* GET get all user likes */
router.get('/', passport.authenticate('jwt', { session: false }), likeController.getUserLikes)

/* PUT add userId to eventId's likes */
router.put('/likePost/:eventId', passport.authenticate('jwt', { session: false }), likeController.likePost)

/* DELETE remove userId from eventId's likes */
router.delete('/unlikePost/:eventId', passport.authenticate('jwt', { session: false }), likeController.unlikePost)

module.exports = router;
