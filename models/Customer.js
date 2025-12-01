const mongoose = require('mongoose')

const Customers = mongoose.model('Customers', {
    name: String,
    phone: String,
    pet:{
        name:String,
        peso:String,
        raca:String,
        idade:String,
        sexo:String


    }
})

module.exports = Customers