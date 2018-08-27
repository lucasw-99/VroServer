const User = require('../models/user.model');
const jwt = require('jsonwebtoken')
const config = require('../config/jwt')


/* POST register user */
// TODO (Lucas Wotton): Change to PUT request
exports.register_user_post = async function(req, res) {
  username = req.body.username
  password = req.body.password
  email = req.body.email
  // TODO (Lucas Wotton): Add default photoUrl?
  photoUrl = null
  const newUser = new User.User(username, password, email, photoUrl)
  try {
    result = await User.addUser(newUser)
    res.json({ success: true, msg: 'registered user with username ' + newUser.username })
  } catch (err) {
    res.json({ success: false, msg: err })
  }
}

/* POST authenticate user with username & password, returns JWT */
// TODO (Lucas Wotton): Change to PUT request?
exports.authenticate_user_post = async function(req, res) {
  const username = req.body.username
  const password = req.body.password
  
  try {
    result = await User.getUserByUsername(username)
    if (!result.success) {
      res.json(result)
      return
    }
    user = result.user
    isMatch = await User.comparePassword(password, user.password)
    if (isMatch) {
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
      return res.json({ success: false, msg: "Password didn't match" })
    }
  } catch (err) {
    // TODO (Lucas Wotton): Use next to throw 500 error?
    throw err
  }
}

/* GET get user profile, authenticates with JWT */
exports.get_user = function(req, res) {
  console.log('in here bish. req:', req)
  if (req.user) {
    res.json({ success: true, user: req.user })
  } else {
    res.json({ success: false, msg: 'User specified by JWT not found.' })
  }
}
