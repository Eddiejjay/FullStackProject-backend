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
const jwt = require('jsonwebtoken')

const PORT = 3003
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

app.use(cors())
app.use(express.json())


const io = require('socket.io')(server, {
  cors: {
    origin: ['http://localhost:3000']
  }
})

const  getSockets = async () => {
  const sockets = await io.in("private").fetchSockets()
  return sockets
}

const players = []

io.on('connection', socket => {
console.log('socket yooo', socket.id)
socket.on("disconnect", (reason) => {
  io.emit('delete-user-from-players-in-lobby', socket.id)
  console.log('socket id ', socket.id, 'disconnected')
});
socket.on('add-online-user', (username) => {
  socket.data.username = username
    io.emit('online-user-back-to-all', username)

})

socket.on('add-private-room-user', (username) => {
  socket.data.username = username
  players.push(username)
  console.log(players)
    // io.emit('players-in-private-yatzyroom', players)

}) 
socket.on('give-private-players', () => {
    io.emit('players-in-private-yatzyroom', players)
    console.log('players server.emit', players)

}) 



socket.on('chat-message',(message, username) => {
  socket.broadcast.emit('chat-message-back-to-all-sockets', `${username}: ${message}`)
})

socket.on('private-chat-message',(privateRoom,message, username) => {
  socket.to(`${privateRoom}`).emit('chat-message-back-to-privatechat', `${username}: ${message}`)
})

socket.on('turn-ready', (player, combination, points, turn, maxturns) => {
console.log('points socketin seruvlta', player, combination, points)
socket.broadcast.emit('turns-stats', player, combination, points, turn, maxturns)

})

socket.on('valisumma-calculation', (allPoints) => {
  socket.broadcast.emit('valisummaPoints', allPoints)
  
  })


socket.on( 'joined-yatzyroom' ,(username) => {
  socket.join("YatzyRoom");
  io.emit("joined-username-back-from-server", username)
  console.log('joined-yatzyroom username', username)
  console.log('socket.rooms clog',socket.rooms);
  // io.emit('sockets-yatzy-room',sockets)

})

socket.on('joinPrivateYatzyRoom', (inputValue) => {
  socket.join(inputValue);
  console.log('socket.rooms clog',socket.rooms);
  io.emit('private-room', inputValue)
  

})




// TÄMÄ DICE VALUE PITÄISI SAADA NOPPAAN 
//ELI PYÖRÄYTTÄÄ HALUTTU NOPPA JONKA VALUEKSI TÄMÄ ARVO 
socket.on('dice-value', (value) => {
  console.log('dice value from server12', value);
  socket.broadcast.emit('dice-value-back-form-server', value)

})
  

})


const url = 'mongodb+srv://Jorma:jorma123@hubbeliinosclusteriinos.upe3w.mongodb.net/YatzyApp?retryWrites=true&w=majority'
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

  // app.get('/api/points/:id',async (req, res) => {

  //   const points = await Points.find({})
  //   console.log('app.get /api/points', points)
  //   res.json(points)
  //   })

  // app.get('/api/players', async (req, res) => {

  //   const players = await Player.find({})
  //   console.log(players)
  //   res.json(players)
  

  
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
// const pointsToDelete = await Points.findById(id)
await Points.findByIdAndRemove(id)
.catch((error) => {
  res.status(400).send({ error: error.message })
})
res.status(204).end()
})

app.delete('/api/players/:id', async (req,res) => {
  const id = req.params.id
  // const pointsToDelete = await Points.findById(id)
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


//ONLINEUSER//ONLINEUSER//ONLINEUSER//ONLINEUSER//ONLINEUSER//ONLINEUSER//ONLINEUSER//ONLINEUSER//ONLINEUSER//ONLINEUSER