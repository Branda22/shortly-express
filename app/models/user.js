var db = require('../config');
var Salt = require('./salt')
var Salts = require('../collections/salts')
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');



var User = db.Model.extend({
  tableName: 'users',
  hasTimestamps: false,
  initialize: function() {
    this.on('creating', function(model, attrs, options) {
      var username = model.get('username');
      var password = model.get('password');
      var hash = bcrypt.hashSync(password, bcrypt.genSaltSync()) 
      model.set('password', hash);
    })
  }
});

module.exports = User;
