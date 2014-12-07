var inherits = require('util').inherits
var EventEmitter = require('events').EventEmitter

function MeteorTransport () {
  var self = this
  self._playerId = Players.insert({})

  function async (fn, context) {
    return function () {
      var args = arguments
      setTimeout(function () {
        fn.apply(context, args)
      })
    }
  }

  Players.find().observe({
    added: async(self._onAdded, self),
    changed: async(self._onChanged, self),
    removed: async(self._onRemoved, self)
  })

  setTimeout(function () {
    self.emit('id', self._playerId)
  })
}
inherits(MeteorTransport, EventEmitter)

MeteorTransport.prototype.emit = function (name, data) {
  if (name == 'state') {
    Players.update(this._playerId, {$set: {state: data}})
  } else if (name == 'avatar') {
    Players.update(this._playerId, {$set: {avatar: data}})
  }
}

MeteorTransport.prototype._onAdded = function (player) {
  if (player._id == this._playerId) return

  this.emit('join', {id: player._id})
}

MeteorTransport.prototype._onChanged = function (player, oldPlayer) {
  if (player._id == this._playerId) return

  if (player.avatar && !oldPlayer.avatar) {
    this.emit('avatar', player.avatar)
  } else {
    this.emit('state', {id: player._id, state: player.state})
  }
}

MeteorTransport.prototype._onRemoved = function (player) {
  this.emit('leave', player._id)
}

module.exports = MeteorTransport