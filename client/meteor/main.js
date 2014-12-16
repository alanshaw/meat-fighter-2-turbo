var Game = require('../Game')
var MeteorTransport = require('./MeteorTransport')

Template.main.helpers({
  ko: function () {
    return window.location.pathname == '/ko.html'
  }
})

Template.main.rendered = function () {
  if (window.location.pathname == '/') {
    var transport = new MeteorTransport 
    var game = new Game(transport)
  }
}