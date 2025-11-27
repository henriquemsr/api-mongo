const express = require('express');
const router = express.Router();
const Task = require('../models/Tasks');
const checkToken = require('../middlewares/authMiddleware');

router.post('/register', checkToken, async (req, res) => {
    try {
        const { task_name, value, date, id_user, name_tutor } = req.body;

        if (!task_name || value == null) {
            return res.status(400).json({ message: 'task_name e value são obrigatórios' });
        }

        const task = await Task.create({
            task_name,
            value,
            date,
            id_user,
            name_tutor
        });

        return res.status(201).json({
            message: 'Agenda criada com sucesso!',
            task
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Erro ao cadastrar agenda' });
    }
});

router.get('/', checkToken, async (req, res) => {

    try {
  let { page = 1, limit = 10, search = '' } = req.query;

  page = Number(page);
  limit = Number(limit);

  const isNumber = !isNaN(search) && search.trim() !== "";

  const query = {
    $or: [
      { task_name: { $regex: search, $options: 'i' } },
      { name_tutor: { $regex: search, $options: 'i' } },
      { id_user: { $regex: search, $options: 'i' } },
      ...(isNumber ? [{ value: Number(search) }] : []) // só filtra se for número
    ]
  };

  const total = await Task.countDocuments(query);

  const result = await Task.find(query)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ name: 1 });

  return res.status(200).json({
    msg: "Sucesso",
    success: true,
    page,
    totalPages: Math.ceil(total / limit),
    totalResults: total,
    result
  });

} catch (error) {
  console.log(error);
  return res.status(500).json({ msg: "Erro ao buscar dados" });
}



})
router.get('/:id', checkToken, async (req, res) => {
    const { id } = req.params

    try {
        const result = await Task.findById(id);
        return res.status(200).json({ msg: "Sucesso", result })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "Erro ao buscar dados" })
    }

})

router.put('/:id', async (req, res) => {

    const { id } = req.params;
    const { task_name, value, date } = req.body;
    try {
        const updateTask = await Task.findByIdAndUpdate(
            id,
            { task_name, value, date },
            { new: true }
        );
        return res.status(200).json({
            msg: "Registro atualizado com sucesso",
            data: updateTask
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "Algo deu errado" })
    }
})

module.exports = router;
