const mongoose = require('mongoose')

const pointsSchema = new mongoose.Schema({
        points : {
                ykkoset: Number,
                kakkoset:Number,
                kolmoset: Number,
                neloset: Number,
                vitoset: Number,
                kutoset: Number,
                valisumma: Number,
                bonus: Number,
                pari: Number,
                kaksiparia: Number,
                kolmesamaa: Number,
                neljasamaa: Number,
                pikkusuora : Number,
                isosuora: Number,
                tayskasi: Number,
                sattuma: Number,
                yatzy : Number,
                pisteet: Number
                  } ,
        player: String
        })
       
pointsSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Points = mongoose.model('Points', pointsSchema)

module.exports = Points