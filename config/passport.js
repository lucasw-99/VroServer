const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const User = require('../models/user.model')
const config = require('../config/jwt')

module.exports = function(passport) {
  var opts = {}
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt')
  opts.secretOrKey = config.secret
  passport.use(new JwtStrategy(opts, async function(jwt_payload, done) {
    try {
      result = await User.getUserById(jwt_payload.id)
      if (result.success) {
        // do not return the hashed password
        result.user.password = null
        return done(null, result.user)
      } else {
        return done(null, false)
      }
    } catch (err) {
      return done(err)
    }
  }))
}
