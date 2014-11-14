var http = require('http')
var ecstatic = require('ecstatic')

var port = process.env.PORT || 1337
var server = http.createServer(ecstatic({root: __dirname + '/client/'}))
var io = require('socket.io')(server)

var players = {}

io.on('connection', function (socket) {
  console.log('A new challenger appears')

  var id = Date.now()

  socket.emit('id', id)

  // Send existing players
  Object.keys(players).forEach(function (id) {
    socket.emit('join', {
      id: id,
      avatar: players[id].avatar,
      state: players[id].state
    })
  })

  // Tell existing players a new challenger appears
  socket.broadcast.emit('join', {id: id})

  players[id] = {}

  // Send state to existing players
  socket.on('state', function (state) {
    console.log('Got state', state)
    players[id].state = state
    socket.broadcast.emit('state', {id: id, state: state})
  })

  // Send avatar url
  socket.on('avatar', function (url) {
    console.log('Got avatar', url, 'for player', id)
    players[id].avatar = url
    socket.broadcast.emit('avatar', {id: id, avatar: url})
  })

  socket.on('disconnect', function () {
    console.log('Challenger disappears' + id)
    delete players[id]
    socket.broadcast.emit('leave', id)
  })
})

server.listen(port)
console.log('Listening on :' + port)
