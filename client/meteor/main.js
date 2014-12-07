var Game = require('../Game')
var MeteorTransport = require('./MeteorTransport')

Meteor.startup(function () {
  var transport = new MeteorTransport 
  var game = new Game(transport)
})
