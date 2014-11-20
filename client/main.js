var md5 = require('md5')
var State = require('./State')
var Player = require('./Player')

function getAvatar () {
  var email = document.getElementById('gravatar').value
  return 'https://en.gravatar.com/avatar/' + md5.digest_s(email)
}

var player = new Player({
  avatar: localStorage.getItem('avatar') || getAvatar(),
  local: true
})
var players = {}

// create a list of ALL game players with optional excluded player
function listPlayers (excludedPlayer) {
  var ids = Object.keys(players)

  if (excludedPlayer == player) {
    return ids.map(function (id) {
      return players[id]
    })
  }

  return [player].concat(ids.reduce(function (list, id) {
    if (id != excludedPlayer.id) {
      list.push()
    }
    return list
  }, []))
}

document.getElementById('gravatar').addEventListener('keyup', function () {
  var avatar = getAvatar()
  localStorage.setItem('email', document.getElementById('gravatar').value)
  localStorage.setItem('avatar', avatar)
  socket.emit('avatar', avatar)
  player.setAvatar(avatar)
})

document.getElementById('gravatar').value = localStorage.getItem('email') || ''

var world = document.getElementById('world')

player.spawn(world)

function loopy (timestamp) {
  if (!loopy.last) loopy.last = timestamp
  var elapsed = timestamp - loopy.last

  var lastState = player.getState()

  player.update(elapsed, listPlayers(player))
  player.redraw()

  var state = player.getState()

  if (!state.equals(lastState)) {
    socket.emit('state', state)
  }

  listPlayers(player).forEach(function (p) {
    p.update(elapsed, listPlayers(p))
    p.redraw()
  })

  loopy.last = timestamp
  requestAnimationFrame(loopy)
}
requestAnimationFrame(loopy)


var socket = io()

socket.on('id', function (id) {
  console.log('Got id', id)
  player.setId(id)
  console.log(player)
})

socket.on('join', function (data) {
  console.log('A new challenger appears', data)
  players[data.id] = new Player(data)
  players[data.id].spawn(world)
})

socket.on('state', function (data) {
  console.log('Got updated state', data)
  if (!players[data.id]) return console.warn('Unknown player', data.id)
  players[data.id].setState(new State(data.state))
})

socket.on('avatar', function (data) {
  console.log('Got updated avatar', data)
  if (!players[data.id]) return console.warn('Unknown player', data.id)
  players[data.id].setAvatar(data.avatar)
})

socket.on('leave', function (id) {
  console.log('Challenger disappears', id)
  if (!players[id]) return console.warn('Unknown player', id)
  players[id].destroy()
  delete players[id]
})

socket.emit('avatar', getAvatar())