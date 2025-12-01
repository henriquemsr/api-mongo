const express = require('express');
const router = express.Router();
const Customers = require('../models/Customer')
const checkToken = require('../middlewares/authMiddleware');
router.post('/register', checkToken, async (req, res) => {
    try {
        const { name, phone, pet } = req.body;

        // 🔍 Validação de campos obrigatórios
        if (!name || !phone) {
            return res.status(422).json({
                success: false,
                msg: "Nome e telefone são obrigatórios."
            });
        }

        // 🔄 Verificar se o cliente já existe (pelo telefone, por exemplo)
        const customerExists = await Customers.findOne({ phone });
        if (customerExists) {
            return res.status(409).json({
                success: false,
                msg: "Telefone já cadastrado para outro cliente."
            });
        }

        const customer = new Customers({ name, phone, pet });
        await customer.save();

        res.status(201).json({
            success: true,
            msg: "Cliente registrado com sucesso!",
            data: customer
        });

    } catch (error) {
        console.error("Erro ao registrar cliente:", error);

        res.status(500).json({
            success: false,
            msg: "Erro interno no servidor",
            error: error.message
        });
    }
});
router.get('/', checkToken, async (req, res) => {
    try {
        let { page = 1, limit = 10, search = '' } = req.query;

        page = Number(page);
        limit = Number(limit);

        const query = {
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ]
        };

        const total = await Customers.countDocuments(query);

        const customers = await Customers.find(query)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            page,
            totalPages: Math.ceil(total / limit),
            totalResults: total,
            customers
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Erro ao buscar clientes",
            error: error.message
        });
    }
});
router.get('/:id', checkToken, async (req, res) => {

    const id = req.params.id;
    try {
        const customer = await Customers.findById(id)
        return res.status(200).json({ data: customer })
    } catch (erro) {
        console.log(erro)
        return res.status(500).json({ msg: "Ocorreu um erro" })
    }
})
router.put('/:id', checkToken, async (req, res) => {
  const id = req.params.id;

  try {
    const customer = await Customers.findByIdAndUpdate(id, req.body, {
      new: true // retorna o documento atualizado
    });

    if (!customer) {
      return res.status(404).json({ msg: "Cliente não encontrado" });
    }

    return res.status(200).json({
      success: true,
      msg: "Cliente atualizado com sucesso!",
      data: customer
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      msg: "Erro ao atualizar cliente",
      error: error.message
    });
  }
});

router.delete('/:id', checkToken, async (req, res) => {
  try {
    const id = req.params.id;
    
    // await para resolver a Promise
    const result = await Customers.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ msg: "Cliente não encontrado" });
    }

    return res.status(200).json({ msg: "Cliente deletado com sucesso!", result });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Ocorreu um erro", error: error.message });
  }
});



module.exports = router;