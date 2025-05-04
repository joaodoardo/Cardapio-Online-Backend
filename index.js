const cors = require('cors');
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();

const prisma = new PrismaClient();
const SECRET = 'seusegredoseguro'; 
app.use(cors());
app.use(express.json());

// Middleware para proteger rotas de admin
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Rotas públicas (clientes)

// Listar todas as categorias
app.get('/categorias', async (req, res) => {
    try {
        const categorias = await prisma.categoria.findMany({
            select: {
                id: true,
                nome: true
            }
        });
        res.json(categorias);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar categorias.' });
    }
});

// Listar itens de uma categoria específica
app.get('/categorias/:id/itens', async (req, res) => {
    const { id } = req.params;

    try {
        const categoria = await prisma.categoria.findUnique({
            where: { id: Number(id) },
            include: {
                itens: true
            }
        });

        if (!categoria) {
            return res.status(404).json({ error: 'Categoria não encontrada.' });
        }

        res.json(categoria.itens);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar itens da categoria.' });
    }
});

// Fazer pedido
app.post('/pedido', async (req, res) => {
    const { nomeCliente, telefone, endereco, observacoes, itens } = req.body;
    if (!nomeCliente || !telefone || !endereco || !Array.isArray(itens) || itens.length === 0) {
        return res.status(400).json({ error: 'Dados do pedido inválidos.' });
    }

    const pedido = await prisma.pedido.create({
        data: {
            nomeCliente,
            telefone,
            endereco,
            observacoes,
            itens: {
                create: itens.map(item => ({
                    itemId: item.itemId,
                    quantidade: item.quantidade
                }))
            }
        }
    });

    res.status(201).json({ message: 'Pedido realizado com sucesso!', pedidoId: pedido.id });
});

















// Rotas administrativas

// Login
app.post('/admin/login', async (req, res) => {
    const { email, senha } = req.body;
    const admin = await prisma.admin.findUnique({ where: { email } });

    if (!admin || !(await bcrypt.compare(senha, admin.senha))) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign({ id: admin.id }, SECRET, { expiresIn: '8h' });
    res.json({ token });
});

// Adicionar categoria
app.post('/admin/categoria', authenticateToken, async (req, res) => {
    const { nome } = req.body;

    if (!nome) {
        return res.status(400).json({ error: 'Nome da categoria é obrigatório.' });
    }

    try {
        const categoria = await prisma.categoria.create({
            data: { nome }
        });

        res.status(201).json(categoria);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar categoria.' });
    }
});

// Adicionar item ao cardápio (corrigido com categoriaId)
app.post('/admin/item', authenticateToken, async (req, res) => {
    const { nome, descricao, preco, categoriaId } = req.body;

    if (!nome || !preco || !categoriaId) {
        return res.status(400).json({ error: 'Nome, preço e categoria são obrigatórios.' });
    }

    try {
        const item = await prisma.item.create({
            data: {
                nome,
                descricao,
                preco,
                categoria: {
                    connect: { id: Number(categoriaId) }
                }
            }
        });

        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar item. Verifique o ID da categoria.' });
    }
});

// Editar item do cardápio
app.put('/admin/item/:id', authenticateToken, async (req, res) => {
    const { nome, descricao, preco } = req.body;
    const { id } = req.params;

    const item = await prisma.item.update({
        where: { id: Number(id) },
        data: { nome, descricao, preco }
    });

    res.json(item);
});

// Excluir item do cardápio
app.delete('/admin/item/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.item.delete({
            where: { id: Number(id) }
        });

        res.json({ message: 'Item excluído com sucesso.' });
    } catch (error) {
        res.status(404).json({ error: 'Item não encontrado ou já excluído.' });
    }
});

// Inicializar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`Servidor rodando na porta ${PORT}`);

    // Inicializar admin padrão se não existir
    const admin = await prisma.admin.findFirst();
    if (!admin) {
        const senhaHash = await bcrypt.hash('admin123', 10);
        await prisma.admin.create({
            data: {
                email: 'admin@pizzaria.com',
                senha: senhaHash
            }
        });
        console.log('Admin padrão criado: admin@pizzaria.com / admin123');
    }
});
