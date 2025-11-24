require('dotenv').config()
const express = require('express')
const mongoose = require("mongoose")
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express()

// config json response
app.use(express.json())
// Public Route
app.get('/', (req, res) => {
    res.status(200).json({ msg: "Bem vindo a nossa API" })
})




const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASS

mongoose.connect("mongodb://localhost:27017/films")
    .then(() => {
        console.log("MongoDB LOCAL conectado!")
        app.listen(3000, () => console.log("Servidor rodando na porta 3000"))
    })
    .catch(err => console.log(err))



app.use('/auth', authRoutes);   // /auth/register e /auth/login
app.use('/user', userRoutes);   // /user/:id