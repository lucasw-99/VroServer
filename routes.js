'use strict';
let mongoose = require('mongoose');
let UserProfile = mongoose.model('UserProfile');
module.exports = app => {
  app.route('/users')
    .get((req, res, next) => {
      UserProfile.find(req.query, (err, users) => {
        if (err) { return next(err); }
        res.json(users);
      });
    })
    .post((req, res, next) => {
      let user = new UserProfile(req.body);
      user.save((err, userProfile) => {
        if (err) { return next(err); }
        res.json(userProfile);
      })
    });

  app.route('/users/:uid')
    .get((req, res, next) => {
      UserProfile.findById(req.params.uid, (err, userProfile) => {
        if (err) { return next(err); }
        res.json(userProfile);
      });
    })
    .post((req, res, next) => {
      UserProfile.findOneAndUpdate(req.params.uid, req.body, {new: true}, (err, userProfile) => {
        if (err) { return next(err); }
        res.json(userProfile);
      });
    })
    .delete((req, res, next) => {
      UserProfile.findOneAndRemove({ _id: req.params.uid }, (err, userProfile) => {
        if (err) { return next(err); }
        res.json(userProfile);
      });
    });
};
