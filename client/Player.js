var classes = require('dom-classes')
var State = require('./State')

const GRAVITY = -0.003
const FRICTION = -0.01

// TODO: Retrieve from _frame
const WIDTH = 50
const HEIGHT = 100

var KeyPressedStateMutator = {
  '37': function (state) {
    state = state.clone()
    if (state.vx > -0.75) {
      state.vx = -0.75
    }
    return state
  },
  '38': function (state) {
    if (state.vy == 0 && state.y == 0) {
      state = state.clone()
      state.vy = 1
    }
    return state
  },
  '39': function (state) {
    if (state.vx < 0.75) {
      state = state.clone()
      state.vx = 0.75
    }
    return state
  }
}

var KeyHitStateMutator = {
'32': function (state) {
    if (!state.hitting) {
      state = state.clone()
      state.hitting = Date.now()
    }
    return state
  }
}

function Player (opts) {
  opts = opts || {}
  this.opts = opts
  this.id = opts.id
  this._frame = null
  this._state = new State(opts.state)
  this._lastState = null
  this._pressed = {}
  this._hit = {}

  if (opts.local) {
    window.addEventListener('keydown', this._onKeydown.bind(this))
    window.addEventListener('keyup', this._onKeyup.bind(this))
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

  var life = document.createElement('div')
  life.className = 'life'

  inner.appendChild(head)
  inner.appendChild(life)
  world.appendChild(frame)

  this._frame = frame
  this._head = head
  this._life = life
}

function insideHorizontally (x1, x2) {
  if (x1 + WIDTH >= x2 && x1 + WIDTH <= x2 + WIDTH) {
    return true
  } else if (x1 >= x2 && x1 <= x2 + WIDTH) {
    return true
  }
  return false
}

function insideVertically (y1, y2) {
  if (y1 + HEIGHT >= y2 && y1 + HEIGHT <= y2 + HEIGHT) {
    return true
  } else if (y1 >= y2 && y1 <= y2 + HEIGHT) {
    return true
  }
  return false
}

function inside (a, b) {
  return insideHorizontally(a.x, b.x) && insideVertically(a.y, b.y)
}

Player.prototype.update = function (elapsed, players) {
  var lastState = this._lastState = this._state
  var state = this._state = this._state.clone()

  if (this.opts.local) {
    Object.keys(this._pressed).forEach(function (keyCode) {
      if (KeyPressedStateMutator[keyCode]) {
        state = this._state = KeyPressedStateMutator[keyCode](state)
      }
      if (KeyHitStateMutator[keyCode] && this._pressed[keyCode] == 1) {
        state = this._state = KeyHitStateMutator[keyCode](state)
        this._pressed[keyCode]++
      }
    }, this)

    if (state.hitting && Date.now() - state.hitting > 100) {
      state.hitting = false
    }

    players.forEach(function (p) {
      var pState = p.getState()
      if (inside(state, pState) && pState.hitting) {
        state.life -= 1
      }
    })
  }

  if (lastState.life != state.life) {
    state.vx = 0
  } else {
    state.x = Math.round(state.x + (state.vx * elapsed))

    if (state.vx >= 0 && state.vx + (FRICTION * elapsed) < 0) {
      state.vx = 0
    } else if (state.vx < 0 && state.vx + (FRICTION * elapsed) >= 0) {
      state.vx = 0
    } else {
      if (state.vx < 0) {
        state.vx -= FRICTION * elapsed
        state.vx = Math.round(state.vx * 100) / 100
      } else {
        state.vx += FRICTION * elapsed
        state.vx = Math.round(state.vx * 100) / 100
      }
    }
  }

  state.y = Math.round(state.y + (state.vy * elapsed))
  state.vy += GRAVITY * elapsed
  state.vy = Math.round(state.vy * 100) / 100

  if (state.y <= 0) {
    state.y = 0
    state.vy = 0
  }

  if (state.x <= 0) {
    state.x = 0
    state.vx = 0
  }

  if (state.x >= 640 - WIDTH) {
    state.x = 640 - WIDTH
    state.vx = 0
  }
}

Player.prototype.redraw = function () {
  var state = this._state

  if (state.hitting) {
    classes(this._frame).add('hitting')
  } else {
    classes(this._frame).remove('hitting')
  }

  this._life.style.width = state.life + '%'

  if (state.life < 25) {
    classes(this._life).remove('warning')
    classes(this._life).add('danger')
  } if (state.life < 75) {
    classes(this._life).add('warning')
  }

  this._frame.style.transform = 'translate(' + state.x + 'px,' + state.y + 'px)'
}

Player.prototype._onKeydown = function (e) {
  console.log('DOWN', e.keyCode)
  if (!this._pressed[e.keyCode])
    this._pressed[e.keyCode] = 1
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
  return this._state.clone()
}

Player.prototype.destroy = function () {
  this._frame.parentNode.removeChild(this._frame)
  this._frame = null
  this._head = null
  this._life = null
}

module.exports = Player