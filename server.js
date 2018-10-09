//app.js
const express = require('express')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const path = require('path')
const cors = require('cors')
const passport = require('passport')
const mongoose = require('mongoose')
const stream = require('getstream');
const algoliasearch = require('algoliasearch');


const userRouter = require('./routes/user')
const followRouter = require('./routes/follow.router')
const eventRouter = require('./routes/event.router')
const likeRouter = require('./routes/like.router')
const attendingRouter = require('./routes/attending.router')
const timelineRouter = require('./routes/timeline.router')
const notificationRouter = require('./routes/notification.router')
const wikiRouter = require('./routes/wiki')
const getstream = require('./getstream')
const algolia = require('./config/algolia')

const db = require('./models/db.js');

// Instantiate a new client (server side)
var streamClient = stream.connect(getstream.config.apiKey, getstream.config.apiSecret, getstream.config.apiAppId);
global.streamClient = streamClient

// Instantiate Algolia client
var algoliaClient = algoliasearch(algolia.application_id, algolia.api_key);
var algoliaUsernameIndex = algoliaClient.initIndex('usernames');
global.algoliaUsernameIndex = algoliaUsernameIndex
global.algoliaUsernameIndex.setSettings({
  'searchableAttributes': [
    'username'
  ]
})

if (global.SQLpool === undefined) {
  global.SQLpool = db.createPool()
}
const init = require('./config/init_tables.js')
init.initTables()

const app = express()
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(cors())
app.use(passport.initialize())
app.use(passport.session())
require('./config/passport')(passport)

app.use('/', wikiRouter)
// route users
app.use('/users', userRouter)
// route follow requests
app.use('/followers', followRouter)
// route event requests
app.use('/events', eventRouter)
// route like requests
app.use('/likes', likeRouter)
// route attending requests
app.use('/attending', attendingRouter)
// route timeline requests
app.use('/timeline', timelineRouter)
// route notification requests
app.use('/notifications', notificationRouter)
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500)
  console.log('returning 500. err:', err)
  // TODO (Lucas Wotton): Change this when not in dev
  res.send(err.message)
})

let port = 8080;
app.listen(port, () => {
    console.log('Server is up and running on port number ' + port);
});
