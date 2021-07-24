const express = require('express')
const app = express()
var http = require('http').createServer(app);
const cors = require('cors')
const mongoose = require('mongoose')
const Player = require('./models/player')
const Points = require('./models/points')
const User = require('./models/user')
const { response } = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
require('dotenv').config()
app.use(express.static('build'))
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 3003
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

const io = require('socket.io')(server, {
  cors: {
    origin: ['http://localhost:3000']
  }
})

const  getSockets = async () => {
  const sockets = await io.in("private").fetchSockets()
  return sockets
}

const socketIdUserMap = {}
let players = []
const socket1 = io.on('connection', socket => {

socket.on("disconnect", (reason) => {
  io.emit('delete-user-from-players-in-lobby', socket.id)
  players = players.filter(player => player !== socketIdUserMap[socket.id])
  delete socketIdUserMap[socket.id];
  console.log('socket id ', socket.id, 'disconnected')
})

socket.on('add-online-user', (username) => {
  socket.data.username = username
    io.emit('online-user-back-to-all', username)
})
socket.on('add-private-room-user', (username) => {
  socket.data.username = username
  console.log('socket id servulta add-privateroom userista ', socket.id)
  if (players.indexOf(username) === -1) {
  players.push(username)
  socketIdUserMap[socket.id] = username;
  console.log('socketId usermap' ,socketIdUserMap)
  console.log(players) 
  }
  return
}) 
socket.on('give-private-players', () => {
    io.emit('players-in-private-yatzyroom', players)
    console.log('players server.emit', players)
}) 

socket.on('chat-message',(message, username) => {
  console.log('chat-message-back.to.ala.sockets.server')
  socket.broadcast.emit('chat-message-back-to-all-sockets', `${username}: ${message}`)
})
socket.on('private-chat-message',(privateRoom,message, username) => {
  socket.to(`${privateRoom}`).emit('chat-message-back-to-privatechat', `${username}: ${message}`)
  console.log('private message vastaan otto servulla')
})
socket.on('turn-ready', (player, combination, points, turn, maxturns) => {
console.log('points socketin seruvlta', player, combination, points)
socket.broadcast.emit('turns-stats', player, combination, points, turn, maxturns)
})
socket.on('valisumma-calculation', (allPoints) => {
  socket.broadcast.emit('valisummaPoints', allPoints)
  })
  socket.on('allPoints-calculation', (allPoints) => {
    socket.broadcast.emit('allPoints', allPoints)
  })
 
socket.on( 'joined-yatzyroom' ,(username) => {
  socket.join("YatzyRoom");
  io.emit("joined-username-back-from-server", username)
  console.log('joined-yatzyroom username', username)
  console.log('socket.rooms clog',socket.rooms);
})
socket.on('joinPrivateYatzyRoom', (inputValue) => {
  socket.join(inputValue);
  console.log('socket.rooms clog',socket.rooms);
  io.emit('private-room', inputValue)
})
socket.on('new-private-yatzyroom', (user, pRoom) => {
  socket.join(pRoom);
  console.log('socket.rooms clog',socket.rooms);
  io.emit('new-private-room-created', pRoom,user)
})
socket.on('dice-value', (value, diceNro) => {
  console.log('dice value from server12', value);
  console.log('dicevlaue and dice nro ', value, diceNro)
  socket.broadcast.emit('dice-value-back-form-server', value, diceNro)
})
socket.on('end-game', () => {
io.emit('end-game-signal-from-server')
players = []
console.log('Players zerod in server')
})
socket.on('player-log-out',  (player) => {
  let filteredPlayers = players.filter(element => element !== player)
  players = filteredPlayers
  console.log('Player remover ', player)
})
})

const url =  process.env.MONGODB_URI
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
.then(result => {
  console.log('Connected to database')
})
.catch((error) => {
  console.log('Connection failed', error.message)
})

app.get('/', (req, res) => {
  res.send('<h1>Hello Welcome to play Yatzy </h1>')
})

app.get('/api/points',async (req, res) => {
  const points = await Points.find({})
  res.json(points)
  })

app.post('/api/points', async (req, res) => {
    const body = req.body
    const pointObject = new Points ({...body})
    const savedPointObject = await pointObject.save()
    .catch((error) => {
            res.status(400).send({ error: error.message })
          })
        res.json(savedPointObject)
      })

app.post('/api/players', async (req, res) => {
  const body = req.body
  const player = new Player({
    player : body.player
  })
  const savedPlayer = await player.save()
    .catch((error) => {
      res.status(400).send({ error: error.message })
    })
  res.json(savedPlayer)
})

app.get('/api/players', async (req, res) => {
  const players = await Player.find({})
  res.json(players)
})

app.delete('/api/points/:id', async (req,res) => {
const id = req.params.id
await Points.findByIdAndRemove(id)
.catch((error) => {
  res.status(400).send({ error: error.message })
})
res.status(204).end()
})

app.delete('/api/players/:id', async (req,res) => {
  const id = req.params.id
  await Player.findByIdAndRemove(id)
  .catch((error) => {
    res.status(400).send({ error: error.message })
  })
  res.status(204).end()
  })

app.put('/api/points/:id', async (req,res) => {
  const id = req.params.id
  const points = req.body
const updatedPoints = await Points.findByIdAndUpdate(id, points,  { new: true })
.catch((error) => {
  res.status(400).send({ error: error.message })
})
res.json(updatedPoints)
})

// LOGIN  LOGIN  LOGIN  LOGIN  LOGIN  LOGIN  LOGIN  LOGIN  LOGIN  LOGIN  LOGIN  LOGIN  LOGIN  LOGIN 
app.post('/api/login', async (request, response) => {
  const body = request.body
  const user = await User.findOne({ username: body.username })
  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(body.password, user.passwordHash)
  
  if (!(user)) {
    return response.status(401).json({
      error: 'invalid username'
    } 
    )
  } else if ( (!(passwordCorrect))) {
    return response.status(401).json({
      error: 'invalid password'
    } 
    )}

  const userForToken = {
    username: user.username,
    id: user._id,
  }
  const token = jwt.sign(userForToken, "koooooo")
  response
    .status(200)
    .send({ token, username: user.username, name: user.name })
})

//USERS USERS USERS USERS USERS USERS USERS USERS USERS USERS USERS USERS 

app.post('/api/users', async (request, response) => {
  const body = request.body
  if ( body.password === undefined) { 
    return response.status(400).json({ error: 'you forget password' })
  }

  else if (body.password.length < 3) {
    return response.status(400).json({ error: 'password is too short, minimum 3' })
  }
  const saltRounds = 10
  const passwordHash = await bcrypt.hash(body.password, saltRounds)
  const user = new User({
    username: body.username,
    passwordHash,
  })
  const savedUser = await user.save()
    .catch((error) => {
      response.status(400).send({ error: error.message })
    })
  response.json(savedUser)
})
