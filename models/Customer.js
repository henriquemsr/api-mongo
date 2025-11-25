const mongoose = require('mongoose')

const Customers = mongoose.model('Customers', {
    name: String,
    phone: String,
    pet_name:String
})

module.exports = Customers