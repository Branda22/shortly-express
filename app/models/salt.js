var db = require('../config');
var bcrypt = require('bcrypt-nodejs')



var Salt = db.Model.extend({
  tableName: 'salts',
  hasTimestamps: false,
  initialize: function() {
    this.on('creating', function(model, attrs, options) {
      //var preSalt = model.get('salt')
      var salt = bcrypt.genSaltSync(5)
      model.set('salt', salt)
    })
  }

})

module.exports = Salt