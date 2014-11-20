var State = require('./State')

const GRAVITY = -0.003
const FRICTION = -0.01

// TODO: Retrieve from _frame
const WIDTH = 50
const HEIGHT = 100

var KeyStateMutator = {
  '37': function (state) {
    state = state.clone()
    if (state.vx > -0.75) {
      state.vx = -0.75
    }
    return state
  },
  '38': function (state) {
    state = state.clone()
    if (state.vy == 0) {
      state.vy = 1
    }
    return state
  },
  '39': function (state) {
    state = state.clone()
    if (state.vx < 0.75) {
      state.vx = 0.75
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

Player.prototype.update = function (elapsed, players) {
  Object.keys(this._pressed).forEach(function (keyCode) {
    if (KeyStateMutator[keyCode]) {
      this._state = KeyStateMutator[keyCode](this._state)
    }
  }, this)

  var state = this._state
  var wantedX = state.x + (state.vx * elapsed)
  var wantedY = state.y + (state.vy * elapsed)

  // Can I be here?
  var canMoveX = true
  var canMoveY = true

  for (var i = 0; i < players.length; i++) {
    var pState = players[i].getState()

    if (insideHorizontally(wantedX, pState.x)) {
      if (insideVertically(wantedY, pState.y)) {
        canMoveX = false
      }
    }

    if (insideVertically(wantedY, pState.y)) {
      if (insideHorizontally(wantedX, pState.x)) {
        canMoveY = false
      }
    }
  }

  if (canMoveX) {
    state.x = wantedX

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
  } else {
    state.vx = 0
  }

  if (canMoveY) {
    state.y = wantedY
    state.vy += GRAVITY * elapsed
  } else {
    state.vy = 0
  }

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
  return this._state.clone()
}

Player.prototype.destroy = function () {
  this._frame.parentNode.removeChild(this._frame)
  this._frame = null
  this._head = null
}

module.exports = Player