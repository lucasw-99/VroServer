const User = require('../models/user.model');
const jwt = require('jsonwebtoken')
const config = require('../config/jwt')


/* GET get all users */
// TODO (Lucas Wotton): Fix this function it throws an error
exports.all_users_get = function(req, res) {
  User.find({}, 'username')
    .populate('username')
    .exec(function(err, list_users) {
      if (err) {
        return next(err)
      }
      res.status(200).send(list_users)
    })
}

/* POST register user */
exports.register_user_post = function(req, res) {
  const newUser = new User({
    name: req.body.name,
    email: req.body.email,
    username: req.body.username,
    password: req.body.password 
  })

  User.addUser(newUser, (err, user) => {
    if (err) {
      res.json({success: false, msg: 'Failed to register user fuck!'})
    } else {
      res.json({success: true, msg: 'Registered user with id ' + user._id})
    }
  })
}

/* POST authenticate user with username & password, returns JWT */
exports.authenticate_user_post = function(req, res) {
  const username = req.body.username
  const password = req.body.password
  
  User.getUserByUsername(username, (err, user) => {
    if (err) {
      throw err
    }

    if (!user) {
      res.json({success: false, msg: 'User not found bruh'})
    }

    User.comparePassword(password, user.password, (err, isMatch) => {
      if (err) {
        throw err
      }

      if (isMatch) {
        const token = jwt.sign(user.toJSON(), config.secret, {
          expiresIn: 604800
        })

        res.json({
          success: true,
          token: 'JWT ' + token,
          user: {
            id: user._id,
            name: user.name,
            username: user.username,
            email: user.email
          }
        })
      } else {
        return res.json({success: false, msg: "Password didn't match"})
      }
    })
  })
}

/* GET get user profile, authenticates with JWT */
exports.get_user = function(req, res) {
  res.json({user: req.user})
}
