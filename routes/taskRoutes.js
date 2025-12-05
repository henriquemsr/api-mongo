const express = require('express');
const router = express.Router();
const Task = require('../models/Tasks');
const checkToken = require('../middlewares/authMiddleware');



router.get('/payments', checkToken, async (req, res) => {
  try {
    const result = await Task.aggregate([
      {
        $group: {
          _id: '$pay',
          totalQtd: { $sum: 1 },        // quantidade de tarefas
          totalValor: { $sum: '$value' } // soma dos valores
        }
      }
    ]);

    // Formata o retorno para facilitar no front
    const response = {
      totalPagos: result.find(r => r._id === true)?.totalQtd || 0,
      valorPagos: result.find(r => r._id === true)?.totalValor || 0,
      totalNaoPagos: result.find(r => r._id === false)?.totalQtd || 0,
      valorNaoPagos: result.find(r => r._id === false)?.totalValor || 0
    };

    return res.status(200).json(response);

  } catch (e) {
    console.error(e);
    return res.status(500).json({ msg: 'Erro no servidor' });
  }
});
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
router.get('/payment/total', checkToken, async (req, res) => {
  try {
    const result = await Task.aggregate([
      {
        $group: {
          _id: '$pay',
          totalValue: { $sum: '$value' },
          totalUsers: { $sum: 1 }
        }
      }
    ]);

    let totalPagos = 0;
    let totalNaoPagos = 0;
    let totalGeral = 0;
    let qtdPagos = 0;
    let qtdNaoPagos = 0;

    result.forEach(item => {
      if (item._id === true) {
        totalPagos = item.totalValue;
        qtdPagos = item.totalUsers;
      } else {
        totalNaoPagos = item.totalValue;
        qtdNaoPagos = item.totalUsers;
      }
    });

    totalGeral = totalPagos + totalNaoPagos;

    return res.status(200).json({
      totalPagos,
      totalNaoPagos,
      totalGeral,
      qtdPagos,
      qtdNaoPagos
    });

  } catch (e) {
    console.error(e);
    return res.status(500).json({ msg: 'Erro no servidor' });
  }
});

router.get('/summary/payments', checkToken, async (req, res) => {
  try {
    const result = await Task.aggregate([
      {
        $group: {
          _id: '$pay',
          totalQtd: { $sum: 1 },        // quantidade de tarefas
          totalValor: { $sum: '$value' } // soma dos valores
        }
      }
    ]);

    // Monta resposta
    const response = {
      totalPagos: result.find(r => r._id === true)?.totalQtd || 0,
      valorPagos: result.find(r => r._id === true)?.totalValor || 0,
      totalNaoPagos: result.find(r => r._id === false)?.totalQtd || 0,
      valorNaoPagos: result.find(r => r._id === false)?.totalValor || 0,
      totalGeral: result.reduce((acc, item) => acc + item.totalValor, 0),
      totalQtdGeral: result.reduce((acc, item) => acc + item.totalQtd, 0)
    };

    return res.status(200).json(response);

  } catch (e) {
    console.error(e);
    return res.status(500).json({ msg: 'Erro no servidor' });
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
            .sort({ date: -1 });

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
router.get('/payment/:param', checkToken, async (req, res) => {
    const param = req.params.param;
    let payValue = false;
    if(param == 0){
        payValue = false
    }else{
        payValue = true
    }
  try {
    const result = await Task.find({ pay: payValue });

    return res.status(200).json({ result });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ msg: 'Erro no servidor' });
  }
});

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
    const { task_name, value, date, name_tutor, pay } = req.body;
    try {
        const updateTask = await Task.findByIdAndUpdate(
            id,
            { task_name, value, date, name_tutor, pay },
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

router.get('/byCustomer/:id', checkToken, async (req, res) => {
    try {
        const id = req.params.id;
        const result = await Task.find({ id_user: id })
        return res.status(200).json({ msg: "Sucesso!", result })
    } catch (error) {
        return res.status(500).json({ mgs: "Registro não encontrado" })
    }
})
router.delete('/:id', checkToken, async (req, res) => {
    try {
        const id = req.params.id;

        // await para resolver a Promise
        const result = await Task.findByIdAndDelete(id);

        if (!result) {
            return res.status(404).json({ msg: "Agenda não encontrada" });
        }

        return res.status(200).json({ msg: "Agenda deletada com sucesso!", result });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "Ocorreu um erro", error: error.message });
    }
});




module.exports = router;
