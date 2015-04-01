var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');



var User = db.Model.extend({
  tableName: 'users',
  hasTimestamps: false,
  initialize: function() {
    this.on('creating', function(model, attrs, options) {
      var username = model.get('username');
      var password = model.get('password');
      bcrypt.hash(password, db.salt, null, function(err, hash) {
        if(err) console.log('hashing err: ',err)
        model.set('password', hash);
        model.set('username', username)
      })
    })
  }
});

module.exports = User;