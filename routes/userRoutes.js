const express = require('express');
const router = express.Router();
const User = require('../models/User');
const checkToken = require('../middlewares/authMiddleware');

router.get("/:id", checkToken, async (req, res) => {
    const id = req.params.id;
    const user = await User.findById(id, '-password');

    if (!user) {
        return res.status(404).json({ msg: "Usuário não encontrado" })
    }
    res.status(200).json({ user })

})

module.exports = router;