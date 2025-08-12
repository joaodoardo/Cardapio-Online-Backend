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

app.post('/pedido', async (req, res) => {
    const { nomeCliente, telefone, endereco, observacoes, itens, metodoPagamento, trocoPara } = req.body;
    
    if (!nomeCliente || !telefone || !endereco || !Array.isArray(itens) || itens.length === 0 || !metodoPagamento) {
        return res.status(400).json({ error: 'Dados do pedido inválidos. Informações do cliente, itens e método de pagamento são obrigatórios.' });
    }

    const pedido = await prisma.pedido.create({
        data: {
            nomeCliente,
            telefone,
            endereco,
            observacoes,
            metodoPagamento,
            trocoPara: trocoPara ? parseFloat(trocoPara) : null,
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


// ======================================================================
// ✅ INÍCIO DA ADIÇÃO - ROTA PÚBLICA DE HORÁRIOS
// ======================================================================
// Rota para buscar os horários de funcionamento (pública)
app.get('/horarios', async (req, res) => {
    try {
        const horarios = await prisma.horarios.findMany({
            orderBy: { diaDaSemana: 'asc' }
        });
        res.json(horarios);
    } catch (error) {
        console.error("Erro ao buscar horários:", error);
        res.status(500).json({ error: 'Erro ao buscar horários de funcionamento.' });
    }
});
// ======================================================================
// ✅ FIM DA ADIÇÃO
// ======================================================================

















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

// Adicionar item ao cardápio
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
    const { nome, descricao, preco, } = req.body;
    const { id } = req.params;

    const item = await prisma.item.update({
        where: { id: Number(id) },
        data: { nome, descricao, preco, }
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





// ======================================================================
// ✅ INÍCIO DA ADIÇÃO - ROTA PROTEGIDA DE HORÁRIOS
// ======================================================================
// Rota para atualizar os horários de funcionamento (protegida)
app.post('/admin/horarios', authenticateToken, async (req, res) => {
    const novosHorarios = req.body;

    if (!Array.isArray(novosHorarios) || novosHorarios.length !== 7) {
        return res.status(400).json({ error: 'Formato de dados inválido. Esperado um array com 7 dias.' });
    }

    try {
        const operacoesDeUpsert = novosHorarios.map(dia => 
            prisma.horarios.upsert({
                where: { diaDaSemana: dia.diaDaSemana },
                update: {
                    nome: dia.nome,
                    aberto: dia.aberto,
                    inicio: dia.inicio,
                    fim: dia.fim,
                },
                create: {
                    diaDaSemana: dia.diaDaSemana,
                    nome: dia.nome,
                    aberto: dia.aberto,
                    inicio: dia.inicio,
                    fim: dia.fim,
                },
            })
        );

        await prisma.$transaction(operacoesDeUpsert);

        res.status(200).json({ message: 'Horários salvos com sucesso!' });

    } catch (error) {
        console.error("Erro ao salvar horários:", error);
        res.status(500).json({ error: 'Erro ao salvar horários.' });
    }
});
// ======================================================================
// ✅ FIM DA ADIÇÃO
// ======================================================================



















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

    // ======================================================================
    // ✅ INÍCIO DA ADIÇÃO - LÓGICA PARA POPULAR HORÁRIOS
    // ======================================================================
    // Inicializar horários padrão se não existirem
    const totalHorarios = await prisma.horarios.count();
    if (totalHorarios === 0) {
        console.log('Nenhum horário encontrado. Criando horários padrão...');
        const defaultSchedule = [
            { diaDaSemana: 0, nome: 'Domingo', aberto: true, inicio: '18:00', fim: '23:00' },
            { diaDaSemana: 1, nome: 'Segunda', aberto: false, inicio: '18:00', fim: '22:00' },
            { diaDaSemana: 2, nome: 'Terça', aberto: true, inicio: '18:00', fim: '22:00' },
            { diaDaSemana: 3, nome: 'Quarta', aberto: true, inicio: '18:00', fim: '22:00' },
            { diaDaSemana: 4, nome: 'Quinta', aberto: true, inicio: '18:00', fim: '22:00' },
            { diaDaSemana: 5, nome: 'Sexta', aberto: true, inicio: '18:00', fim: '23:00' },
            { diaDaSemana: 6, nome: 'Sábado', aberto: true, inicio: '18:00', fim: '23:00' },
        ];
        
        await prisma.horarios.createMany({
            data: defaultSchedule,
        });
        console.log('Horários padrão criados com sucesso.');
    }
    // ======================================================================
    // ✅ FIM DA ADIÇÃO
    // ======================================================================
});
