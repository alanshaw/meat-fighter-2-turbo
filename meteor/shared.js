Players = new Mongo.Collection('players')
Connections = new Mongo.Collection('connections')

Players.allow({
  insert: function (uid, player) {
    console.log('A new challenger appears')
    return true
  },
  update: function (uid, player) {
    //console.log('Update from', player._id, player.state)
    return true
  },
  remove: function (uid, player) {
    console.log('Player KO', player._id)
    return true
  }
})

Connections.allow({
  insert: function (uid, conn) {
    console.log('A new connection appears')
    return true
  },
  update: function (uid, conn) {
    //console.log('Ping from', conn._id)
    return true
  }
})