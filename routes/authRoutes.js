
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/register', async (req, res) => {
    const { name, email, password, confirmpassword } = req.body;

    // Validação
    if (!name) {
        return res.status(422).json({ msg: "O nome é obrigatório" });
    }
    if (!email) {
        return res.status(422).json({ msg: "O email é obrigatório" });
    }
    if (!password) {
        return res.status(422).json({ msg: "A senha é obrigatória" });
    }
    if (password !== confirmpassword) {
        return res.status(422).json({ msg: "As senhas não conferem" });
    }

    //   check if user exists
    const userExists = await User.findOne({ email: email })
    if (userExists) {
        return res.status(422).json({ msg: "Por favor, utilize outro email" })
    }

    // create password
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)
    const user = new User({
        name,
        email,
        password: passwordHash
    })

    try {
        await user.save()
        res.status(201).json({ msg: "Usuário registrado com sucesso!" });
    } catch (error) {
        res.status(500).json({ msg: error })
    }
    // Resposta de sucesso (temporária)
});
// Login User
router.post("/login", async (req, res) => {
    const { email, password } = req.body
    if (!password) {
        return res.status(422).json({ msg: "A senha é obrigatória" });
    }
    if (!email) {
        return res.status(422).json({ msg: "O email é obrigatório" });
    }
    //   check if user exists
    const user = await User.findOne({ email: email })
    if (!user) {
        return res.status(404).json({ msg: "Usuário não encontrado" })
    }
    // check if password match
    const checkPassword = await bcrypt.compare(password, user.password)
    if (!checkPassword) {
        return res.status(422).json({ msg: "Senha inválida" })
    }

    try {
        const secret = process.env.SECRET
        const token = jwt.sign(
            {
                id: user.id
            },
            secret,
        )
        res.status(200).json({ msg: "autenticação realizada com sucesso", token,id_user:user.id })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Erro no servidor",
            
        })

    }
})

module.exports = router;