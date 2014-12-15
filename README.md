# Meat Fighter 2 Turbo

An experiment with meteor and websockets.

We have two versions of the same game that share 90% of the code.

The first version uses socket.io to communicate state information between players. Your instance of the game emits your player's position and listens for updates from other players. The server does the job of relaying the state data to the other connected clients.

```
                   +---> client
                   |
client ---> server +---> client
                   |
                   +---> client
```

The second version uses meteor and mongo collections to synchronise state. There's a `Players` collection that the client listens to changes on. The client inserts it's own player into the collection and updates it with position info. Meteor takes care of communicating the change and addition/removal of players.

```
                    \  |  /
client             - MAGIC -       +---> client
  |                 /  |  \        |
  |                                +---> client
  +---> Players                    |
                                   +---> client
```

There is a `MeteorTransport.js` which does the job of exposing Meteor's mongo collections as a socket.io interface. It adds observers for changes on the `Players` collection and emits them as events. This allows us to use most of the same code for both versions of the game.

## Getting started

### Build

```
npm run browserify
# or
npm run browserify-meteor
```

### Run

**socket.io**
```
npm start
open http://localhost:1337
```

**meteor**
```
npm run start-meteor
open http://localhost:3000
```

### Dev

The project uses browserify to allow using CommonJS modules in the browser. There is a watchify script for both versions of the game to automatically rebuild when you change files:

```
npm run watchify
# or
npm run watchify-meteor
```