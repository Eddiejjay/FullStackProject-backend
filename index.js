const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const Player = require('./models/player')
const Points = require('./models/points')
const User = require('./models/user')
const { response } = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
app.use(cors())
app.use(express.json())

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
  console.log('app.get /api/points', points)
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
    console.log('Post points body', body)
    const pointObject = new Points ({...body})
    const savedPointObject = await pointObject.save()
    .catch((error) => {
            res.status(400).send({ error: error.message })
          })
        res.json(savedPointObject)
      })
    

app.post('/api/players', async (req, res) => {
  const body = req.body
  console.log('body app.postista',body)

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
  console.log(players)
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






const PORT = 3003
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})




