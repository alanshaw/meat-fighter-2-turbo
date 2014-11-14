var GRAVITY = -0.002
var FRICTION = -0.01

function State () {
  this.x = 0
  this.y = 50
  this.vx = 0
  this.vy = 0
}

State.prototype.equals = function (state) {
  return this.x == state.x &&
         this.y == state.y &&
         this.vx == state.vx &&
         this.vy == state.vy
}

function Player (opts) {
  opts = opts || {}
  this.opts = opts
  this.id = opts.id
  this._frame = null
  this._state = opts.state || new State()
  this._pressed = {}

  if (opts.local) {
    window.addEventListener("keydown", this._onKeydown.bind(this))
    window.addEventListener("keyup", this._onKeyup.bind(this))
  }
}

Player.prototype.spawn = function (world) {
  var frame = document.createElement('div')
  frame.className = 'player'

  var inner = document.createElement('div')
  frame.appendChild(inner)

  var head = document.createElement('div')
  head.className = 'head'
  head.style.backgroundImage = 'url(' + this.opts.avatar + ')'

  inner.appendChild(head)
  world.appendChild(frame)

  this._frame = frame
  this._head = head
}

Player.prototype.update = function (elapsed) {
  Object.keys(this._pressed).forEach(function (keyCode) {
    if (KeyStateMutator[keyCode]) {
      this._state = KeyStateMutator[keyCode](this._state)
    }
  }, this)

  var state = this._state
  state.x += state.vx * elapsed

  if (state.vx >= 0 && state.vx + (FRICTION * elapsed) < 0) {
    state.vx = 0
  } else if (state.vx < 0 && state.vx + (FRICTION * elapsed) >= 0) {
    state.vx = 0
  } else {
    if (state.vx < 0) {
      state.vx -= FRICTION * elapsed 
    } else {
      state.vx += FRICTION * elapsed 
    }
  }

  state.y += state.vy * elapsed
  state.vy += GRAVITY * elapsed

  if (state.y <= 0) {
    state.y = 0
    state.vy = 0
  }

  if (state.x <= 0) {
    state.x = 0
    state.vx = 0
  }

  if (state.x >= 590) {
    state.x = 590
    state.vx = 0
  }
}

Player.prototype.redraw = function () {
  var state = this._state
  this._frame.style.transform = 'translate(' + state.x + 'px,' + state.y + 'px)'
}

Player.prototype._onKeydown = function (e) {
  console.log('DOWN', e.keyCode)
  this._pressed[e.keyCode] = true
}

Player.prototype._onKeyup = function (e) {
  console.log('UP', e.keyCode)
  delete this._pressed[e.keyCode]
}

Player.prototype.setAvatar = function (avatar) {
  this.opts.avatar = avatar
  this._head.style.backgroundImage = 'url(' + avatar + ')'
}

Player.prototype.setId = function (id) {
  this.id = id
  this.opts.id = id
}

Player.prototype.setState = function (state) {
  this._state = state
}

Player.prototype.getState = function () {
  var state = new State
  state.x = this._state.x
  state.y = this._state.y
  state.vx = this._state.vx
  state.vy = this._state.vy
  return state
}

Player.prototype.destroy = function () {
  this._frame.parentNode.removeChild(this._frame)
  this._frame = null
  this._head = null
}

var KeyStateMutator = {
  '37': function (state) {
    if (state.vx > -0.75) {
      state.vx = -0.75
    }
    return state
  },
  '38': function (state) {
    if (state.y == 0) {
      state.vy = 1
    }
    return state
  },
  '39': function (state) {
    if (state.vx < 0.75) {
      state.vx = 0.75
    }
    return state
  }
}

function getAvatar () {
  var email = document.getElementById('gravatar').value
  return 'https://en.gravatar.com/avatar/' + md5(email)
}

var player = new Player({
  avatar: localStorage.getItem('avatar') || getAvatar(),
  local: true
})
var players = {}

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

  player.update(elapsed)
  player.redraw()

  var state = player.getState()

  if (!state.equals(lastState)) {
    socket.emit('state', state)
  }

  Object.keys(players).forEach(function (id) {
    players[id].update(elapsed)
    players[id].redraw()
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
  players[data.id].setState(data.state)
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