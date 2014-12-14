Meteor.publish('players', function () {
  return Players.find()
})

Meteor.setInterval(function () {
  var conns = Connections.find({lastSeen: {$lt: Date.now() - 5000}})

  if (conns.count()) {
    console.log('Clearing out', conns.count(), 'connections')
  }

  conns.forEach(function (c) {
    Players.remove({_id: c.playerId})
    Connections.remove({_id: c._id})
  })
}, 2500)