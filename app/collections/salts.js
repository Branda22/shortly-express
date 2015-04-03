var db = require('../config')
var Salt = require('../models/salt')

var Salts = new db.Collection()

Salts.model = Salt


module.exports = Salts