var md5 = require('md5')
var State = require('./State')
var Player = require('./Player')

function Game (transport) {
  this._transport = transport

  this._player = new Player({
    avatar: localStorage.getItem('avatar') || Game.getAvatar(),
    local: true
  })
  this._players = {}

  document.getElementById('gravatar').addEventListener('keyup', function () {
    var avatar = Game.getAvatar()
    localStorage.setItem('email', document.getElementById('gravatar').value)
    localStorage.setItem('avatar', avatar)
    transport.emit('avatar', avatar)
    player.setAvatar(avatar)
  })

  document.getElementById('gravatar').value = localStorage.getItem('email') || ''

  this._world = document.getElementById('world')

  this._player.spawn(this._world)

  requestAnimationFrame(this._loopy.bind(this))

  transport.on('id', this._onId.bind(this))
  transport.on('join', this._onJoin.bind(this))
  transport.on('state', this._onState.bind(this))
  transport.on('avatar', this._onAvatar.bind(this))
  transport.on('leave', this._onLeave.bind(this))
}

Game.getAvatar = function () {
  var email = document.getElementById('gravatar').value
  return 'https://en.gravatar.com/avatar/' + md5.digest_s(email)
}

// create a list of ALL game players with optional excluded player
Game.prototype._listPlayers = function (excludedPlayer) {
  var ids = Object.keys(this._players)

  if (excludedPlayer == this._player) {
    return ids.map(function (id) {
      return this._players[id]
    }, this)
  }

  return [this._player].concat(ids.reduce(function (list, id) {
    if (id != excludedPlayer.id) {
      list.push()
    }
    return list
  }, []))
}

Game.prototype._loopy = function (timestamp) {
  if (!this._lastLoopy) this._lastLoopy = timestamp
  var elapsed = timestamp - this._lastLoopy

  var lastState = this._player.getState()

  this._player.update(elapsed, this._listPlayers(this._player))
  this._player.redraw()

  var state = this._player.getState()

  if (!state.equals(lastState)) {
    this._transport.emit('state', {id: this._player.id, state: state})
  }

  this._listPlayers(this._player).forEach(function (p) {
    p.update(elapsed, this._listPlayers(p))
    p.redraw()
  }, this)

  this._lastLoopy = timestamp
  requestAnimationFrame(this._loopy.bind(this))
}

Game.prototype._onId = function (id) {
  console.log('Got id', id)
  this._player.setId(id)
  this._transport.emit('avatar', {id: id, avatar: Game.getAvatar()})
}

Game.prototype._onJoin = function (data) {
  console.log('A new challenger appears', data)
  this._players[data.id] = new Player(data)
  this._players[data.id].spawn(world)
}

Game.prototype._onState = function (data) {
  console.log('Got updated state', data)
  if (!this._players[data.id]) return console.warn('Unknown player', data.id)
  this._players[data.id].setState(new State(data.state))
}

Game.prototype._onAvatar = function (data) {
  console.log('Got updated avatar', data)
  if (!this._players[data.id]) return console.warn('Unknown player', data.id)
  this._players[data.id].setAvatar(data.avatar)
}

Game.prototype._onLeave = function (id) {
  console.log('Challenger disappears', id)
  if (!this._players[id]) return console.warn('Unknown player', id)
  this._players[id].destroy()
  delete this._players[id]
}

module.exports = Game