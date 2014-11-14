var GRAVITY = -0.002
var FRICTION = -0.01

function State () {
  this.x = 0
  this.y = 50
  this.vx = 0
  this.vy = 0
}

function Player (opts) {
  opts = opts || {}
  this.opts = opts
  this._frame = null
  this._state = new State()
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

document.getElementById('gravatar').addEventListener('keyup', function () {
  var avatar = getAvatar()
  localStorage.setItem('email', document.getElementById('gravatar').value)
  localStorage.setItem('avatar', avatar)
  player.setAvatar(avatar)
})

document.getElementById('gravatar').value = localStorage.getItem('email') || ''

var world = document.getElementById('world')

player.spawn(world)

function loopy (timestamp) {
  if (!loopy.last) loopy.last = timestamp
  var elapsed = timestamp - loopy.last

  player.update(elapsed)
  player.redraw()

  loopy.last = timestamp
  requestAnimationFrame(loopy)
}
requestAnimationFrame(loopy)