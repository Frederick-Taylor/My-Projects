const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const path = require('path')

// Static Content
app.use(express.static('html'))

let hasHome = false
let homePlayer = ''

let hasVisitor = false
let visitorPlayer = ''

let spectatorList = []

let dequeueCount = 0

// Entrypoint, serve default client app
app.get('/', (req, res) => {
  res.sendFile('/curling.html', { root: path.join(__dirname, 'html') })
});

io.on('connection', (socket) => {
  console.log('a user connected, socket id is: ' + socket.id);
  if(hasHome){
    var closing = JSON.stringify({"HomePlayer":socket.id})
    socket.emit('HomeRegistered', closing)
  }
  if(hasVisitor){
    var closing = JSON.stringify({"VisitorPlayer":socket.id})
    socket.emit('VisitorRegistered', closing)
  }

  socket.on('testt', msg => {
    var theThing = JSON.parse(msg);
    console.log("Client said: " + theThing.Test);
  });

  socket.on('NewHomePlayer', msg =>
  {
    var newHome = JSON.parse(msg);
    hasHome = true
    homePlayer = socket.id
    console.log('')
    console.log("Home Player Client: " + newHome)
    console.log("Home Player Client ID: " + socket.id)

    socket.join("registeredClients")
    
    var closing = JSON.stringify({"HomePlayer":socket.id})
    socket.broadcast.emit('HomeRegistered', closing)
    console.log('Close Sent')
  })

  socket.on('NewVisitorPlayer', msg =>
  {
    var newVisitor = JSON.parse(msg);
    hasVisitor = true
    visitorPlayer = socket.id
    console.log('')
    console.log("Visitor Player Client: " + newVisitor)
    console.log("Visitor Player Client ID: " + socket.id)

    socket.join("registeredClients")
    
    var closing = JSON.stringify({"VisitorPlayer":socket.id})
    socket.broadcast.emit('VisitorRegistered', closing)
    console.log('Close Sent')
  })

  socket.on('NewSpectator', msg =>
  {
    socket.join("registeredClients")
  })

  socket.on('stoneStatus', function(data){
    io.to("registeredClients").emit('stoneStatus', data)
  })

  socket.on('whosTurn', function(data){
    console.log('Turn: ' + data)
    io.emit('whosTurn', data)
  })

  socket.on('trackDequeue', function(data){
    dequeueCount++

    let score = JSON.parse(data)
    console.log('Dequeue Count: ' + dequeueCount)
    console.log('Score: ' + data)
    if(dequeueCount === 8){
      dequeueCount = 0
      let lastWinner = 'red'
      if(score.home < score.visitor){
        lastWinner = 'yellow'
      }
      console.log('Last Winner: ' + lastWinner)
      io.emit('newStart', lastWinner)
    }
  })

  socket.on('newGame', function(data){
    console.log('New Game')
    socket.broadcast.emit('newGame', data)
  })

  socket.on('disconnect', function() {
    if(homePlayer == socket.id){
      homePlayer = ''
      hasHome = false
      console.log('')
      console.log('Removing Home Player with ID: ' + socket.id)

      socket.broadcast.emit('HomeUnregistered')
    }

    if(visitorPlayer == socket.id){
      visitorPlayer = ''
      hasVisitor = false
      console.log('')
      console.log('Removing Visitor Player with ID: ' + socket.id)

      socket.broadcast.emit('VisitorUnregistered')
    }
  })
});

http.listen(3000, () => {
  console.log('listening on *:3000');
  console.log('http://localhost:3000/')
});