const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const User = require('../models/user.model')
const config = require('../config/jwt')

module.exports = function(passport) {
  var opts = {}
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt')
  opts.secretOrKey = config.secret
  passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
    User.getUserById(jwt_payload.id, (err, user) => {
      if (err) {
        return done(err, false)
      }

      console.log(user)
      if (user) {
        return done(null, user)
      } else {
        return done(null, false)
      }
    })
  }))
}
