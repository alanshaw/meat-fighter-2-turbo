var xtend = require('xtend/mutable')

function State (data) {
  this.x = 0
  this.y = 0
  this.vx = 0
  this.vy = 0

  if (data) xtend(this, data)
}

State.prototype.clone = function () {
  return new State(this)
}

State.prototype.equals = function (state) {
  return this.x == state.x &&
         this.y == state.y &&
         this.vx == state.vx &&
         this.vy == state.vy
}

module.exports = State