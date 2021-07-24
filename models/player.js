const mongoose = require('mongoose')

const playerSchema = new mongoose.Schema({
    player: String
})
       
playerSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Player = mongoose.model('Player', playerSchema)
module.exports = Player

