var xtend = require('xtend/mutable')

function State (data) {
  this.x = 0
  this.y = 0
  this.vx = 0
  this.vy = 0
  this.hitting = false
  this.life = 100
  this.stunned = false

  if (data) xtend(this, data)
}

State.prototype.clone = function () {
  return new State(this)
}

State.prototype.equals = function (state) {
  return this.x == state.x &&
         this.y == state.y &&
         this.vx == state.vx &&
         this.vy == state.vy &&
         this.hitting == state.hitting &&
         this.life == state.life &&
         this.stunned == state.stunned
}

module.exports = State