var inherits = require('util').inherits
var EventEmitter = require('events').EventEmitter

function MeteorTransport () {
  var self = this
  self._playerId = Players.insert({createdAt: Date.now()})
  self._connId = Connections.insert({
    playerId: self._playerId,
    lastSeen: Date.now()
  })

  Players.find().observe({
    added: self._onAdded.bind(self),
    changed: self._onChanged.bind(self),
    removed: self._onRemoved.bind(self)
  })

  var emit = this.emit

  this.emit = function () {
    self._emit.apply(self, arguments)
    emit.apply(self, arguments)
  }

  Meteor.setTimeout(function () {
    self.emit('id', self._playerId)
    Meteor.subscribe('players')
  })

  Meteor.setInterval(function () {
    Connections.update(self._connId, {$set: {lastSeen: Date.now()}})
  }, 1000)
}
inherits(MeteorTransport, EventEmitter)

MeteorTransport.prototype._emit = function (name, data) {
  if (name == 'state') {
    Players.update(data.id, {$set: {state: data.state}})
  } else if (name == 'avatar') {
    Players.update(data.id, {$set: {avatar: data.avatar}})
  }
}

MeteorTransport.prototype._onAdded = function (player) {
  if (player._id == this._playerId) return

  this.emit('join', {id: player._id})

  if (player.state) {
    this.emit('state', {id: player._id, state: player.state})
  }

  if (player.avatar) {
    this.emit('avatar', {id: player._id, avatar: player.avatar})
  }
}

MeteorTransport.prototype._onChanged = function (player, oldPlayer) {
  if (player._id == this._playerId) return

  if (player.avatar && !oldPlayer.avatar) {
    this.emit('avatar', {id: player._id, avatar: player.avatar})
  } else {
    this.emit('state', {id: player._id, state: player.state})
  }
}

MeteorTransport.prototype._onRemoved = function (player) {
  this.emit('leave', player._id)
}

module.exports = MeteorTransport