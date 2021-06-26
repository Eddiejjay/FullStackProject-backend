const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const Player = require('./models/player')
const Points = require('./models/points')
const { response } = require('express')
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





const PORT = 3003
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})



// const points = [
  // {
  //   "points": {
  //     "ykkoset": 1,
  //     "kakkoset": 2,
  //     "kolmoset": 0,
  //     "neloset": 0,
  //     "vitoset": 0,
  //     "kutoset": 0,
  //     "valisumma": 0,
  //     "bonus": 0,
  //     "pari": 0,
  //     "kaksiparia": 0,
  //     "kolmesamaa": 0,
  //     "neljasamaa": 0,
  //     "pikkusuora": 0,
  //     "isosuora": 0,
  //     "tayskasi": 0,
  //     "sattuma": 0,
  //     "yatzy": 0,
  //     "pisteet": 0
  //   },
  //   "player": "Keissi",
  //   "id": 1
  // },
  // {
  //   "points": {
  //     "ykkoset": 1,
  //     "kakkoset": 2,
  //     "kolmoset": 0,
  //     "neloset": 0,
  //     "vitoset": 0,
  //     "kutoset": 0,
  //     "valisumma": 0,
  //     "bonus": 0,
  //     "pari": 0,
  //     "kaksiparia": 0,
  //     "kolmesamaa": 0,
  //     "neljasamaa": 0,
  //     "pikkusuora": 0,
  //     "isosuora": 0,
  //     "tayskasi": 0,
  //     "sattuma": 0,
  //     "yatzy": 0,
  //     "pisteet": 0
  //   },
  //   "player": "Kale",
  //   "id": 2
  // },
  // {
  //   "points": {
  //     "ykkoset": 1,
  //     "kakkoset": 2,
  //     "kolmoset": 0,
  //     "neloset": 0,
  //     "vitoset": 0,
  //     "kutoset": 0,
  //     "valisumma": 0,
  //     "bonus": 0,
  //     "pari": 0,
  //     "kaksiparia": 0,
  //     "kolmesamaa": 0,
  //     "neljasamaa": 0,
  //     "pikkusuora": 0,
  //     "isosuora": 0,
  //     "tayskasi": 0,
  //     "sattuma": 0,
  //     "yatzy": 0,
  //     "pisteet": 0
  //   },
  //   "player": "Jokke",
  //   "id": 3
  // },
  // {
  //   "points": {
  //     "ykkoset": 1,
  //     "kakkoset": 2,
  //     "kolmoset": 0,
  //     "neloset": 0,
  //     "vitoset": 0,
  //     "kutoset": 0,
  //     "valisumma": 0,
  //     "bonus": 0,
  //     "pari": 0,
  //     "kaksiparia": 0,
  //     "kolmesamaa": 0,
  //     "neljasamaa": 0,
  //     "pikkusuora": 0,
  //     "isosuora": 0,
  //     "tayskasi": 0,
  //     "sattuma": 0,
  //     "yatzy": 0,
  //     "pisteet": 0
  //   },
  //   "player": "Kicke",
  //   "id": 4
  // },
  // {
  //   "points": {
  //     "ykkoset": 1,
  //     "kakkoset": 2,
  //     "kolmoset": 0,
  //     "neloset": 0,
  //     "vitoset": 0,
  //     "kutoset": 0,
  //     "valisumma": 0,
  //     "bonus": 0,
  //     "pari": 0,
  //     "kaksiparia": 0,
  //     "kolmesamaa": 0,
  //     "neljasamaa": 0,
  //     "pikkusuora": 0,
  //     "isosuora": 0,
  //     "tayskasi": 0,
  //     "sattuma": 0,
  //     "yatzy": 0,
  //     "pisteet": 0
  //   },
  //   "player": "Himplaaja",
  //   "id": 5
  // }
// ]


