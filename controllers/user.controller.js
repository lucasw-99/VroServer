const User = require('../models/user.model');
const jwt = require('jsonwebtoken')
const config = require('../config/jwt')


/* POST register user */
exports.register_user_post = function(req, res) {
  username = req.body.username
  password = req.body.password
  email = req.body.email
  // TODO (Lucas Wotton): Add default photoUrl?
  photoUrl = null
  const newUser = new User.User(username, password, email, photoUrl)
  User.addUser(newUser, (err, user) => {
    if (err) {
      console.log(err)
      res.json({success: false, msg: err})
    } else {
      res.json({success: true, msg: 'Registered user with username ' + user.username})
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
        console.log(user)
        const token = jwt.sign(JSON.stringify(user), config.secret, {})

        res.json({
          success: true,
          token: 'JWT ' + token,
          user: {
            id: user.id,
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
