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
                itens: {
                    where: { disponivel: true },
                    orderBy: [
                        { order: 'asc' },
                        { id: 'asc' }
                    ]
                }
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
    const { nomeCliente, telefone, endereco, observacoes, itens, metodoPagamento, trocoPara, taxaEntrega} = req.body;
    
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
            taxaEntrega: taxaEntrega || 0,
            trocoPara: trocoPara ? parseFloat(trocoPara) : null,
            itens: {
                create: itens.map(item => ({
                    itemId: item.itemId,
                    quantidade: item.quantidade,
                    tamanho: item.tamanho,
                    precoFinal: item.precoFinal,
                    bordaId: item.bordaId || null,
                    precoBorda: item.precoBorda ? parseFloat(item.precoBorda) : null,
                    tipoMassaId: item.tipoMassaId || null
                }))
            }
        }
    });

    res.status(201).json({ message: 'Pedido realizado com sucesso!', pedidoId: pedido.id });
});









// ======================================================================
// ✅ INÍCIO DA ADIÇÃO - ROTA PÚBLICA PARA STATUS DE PEDIDO DO CLIENTE
// ======================================================================
// Buscar pedidos de um cliente pelo número de telefone
app.get('/pedidos/cliente/:telefone', async (req, res) => {
    const { telefone } = req.params;

    if (!telefone) {
        return res.status(400).json({ error: 'Número de telefone é obrigatório.' });
    }

    try {
        const pedidosDoCliente = await prisma.pedido.findMany({
            where: {
                telefone: telefone
            },
            include: {
                itens: {
                    include: {
                        item: {
                            select: {
                                nome: true
                            }
                        },
                        borda: true,
                        tipoMassa: true
                    }
                }
            },
            orderBy: {
                criadoEm: 'desc'
            },
            take: 10
        });

        if (!pedidosDoCliente || pedidosDoCliente.length === 0) {
            return res.status(404).json({ message: 'Nenhum pedido encontrado para este número.' });
        }

        res.json(pedidosDoCliente);

    } catch (error) {
        console.error("Erro ao buscar pedidos do cliente:", error);
        res.status(500).json({ error: 'Erro interno ao buscar seus pedidos.' });
    }
});
// ======================================================================
// ✅ FIM DA ADIÇÃO
// ======================================================================






// ======================================================================
// ✅ INÍCIO DA ADIÇÃO - ROTAS DE FRETE (ENTREGA)
// ======================================================================

// Rota PÚBLICA para buscar a taxa de entrega
app.get('/entrega', async (req, res) => {
    try {
        const entrega = await prisma.entrega.findFirst();
        if (!entrega) {
            // Se por algum motivo não houver taxa, retorna um erro ou um valor padrão
            return res.status(404).json({ error: 'Taxa de entrega não configurada.' });
        }
        res.json(entrega);
    } catch (error) {
        console.error("Erro ao buscar taxa de entrega:", error);
        res.status(500).json({ error: 'Erro interno ao buscar taxa de entrega.' });
    }
});

// Rota PROTEGIDA para atualizar a taxa de entrega
app.put('/admin/entrega/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { taxaEntrega } = req.body;

    if (taxaEntrega === undefined || taxaEntrega === null || isNaN(parseFloat(taxaEntrega))) {
        return res.status(400).json({ error: 'O valor da taxa de entrega é inválido.' });
    }

    try {
        const entregaAtualizada = await prisma.entrega.update({
            where: { id: Number(id) },
            data: { taxaEntrega: parseFloat(taxaEntrega) },
        });
        res.json(entregaAtualizada);
    } catch (error) {
        console.error("Erro ao atualizar taxa de entrega:", error);
        res.status(404).json({ error: 'Registro de entrega não encontrado.' });
    }
});

// ======================================================================
// ✅ FIM DA ADIÇÃO
// ======================================================================































// ======================================================================
// ✅ INÍCIO DA ADIÇÃO - ROTAS PARA GERENCIAR PEDIDOS
// ======================================================================

// Listar todos os pedidos com status 1, 2 ou 3
app.get('/admin/pedidos', authenticateToken, async (req, res) => {
    try {
        const pedidos = await prisma.pedido.findMany({
            where: {
                status: {
                    in: [1, 2, 3] // Busca apenas pedidos "Em análise", "Em produção" ou "Pronto para entrega"
                }
            },
            include: {
                itens: {
                    include: {
                        item: true,
                        borda: true,
                        tipoMassa: true
                    }
                }
            },
            orderBy: {
                criadoEm: 'asc' // Ordena pelos mais antigos primeiro
            }
        });
        res.json(pedidos);
    } catch (error) {
        console.error("Erro ao buscar pedidos:", error);
        res.status(500).json({ error: 'Erro ao buscar pedidos.' });
    }
});

// Atualizar o status de um pedido
app.put('/admin/pedidos/:id/status', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || ![1, 2, 3, 4, 5].includes(status)) { // 1=Em análise, 2=Na Fila, 3=Pronto, 4=Finalizado, 5=Cancelado
        return res.status(400).json({ error: 'Status inválido.' });
    }

    try {
        const pedidoAtualizado = await prisma.pedido.update({
            where: { id: Number(id) },
            data: { status: Number(status) }
        });
        res.json(pedidoAtualizado);
    } catch (error) {
        console.error("Erro ao atualizar status do pedido:", error);
        res.status(404).json({ error: 'Pedido não encontrado.' });
    }
});

// ======================================================================
// ✅ FIM DA ADIÇÃO
// ======================================================================



























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


// ======================================================================
// ✅ INÍCIO DA ADIÇÃO - ROTAS PÚBLICAS PARA BORDAS E TIPOS DE MASSA
// ======================================================================

// Listar todas as bordas disponíveis (rota pública)
app.get('/bordas', async (req, res) => {
    try {
        const bordas = await prisma.borda.findMany({
            where: { disponivel: true },
            orderBy: { nome: 'asc' }
        });
        res.json(bordas);
    } catch (error) {
        console.error("Erro ao buscar bordas:", error);
        res.status(500).json({ error: 'Erro ao buscar bordas.' });
    }
});

// Listar todos os tipos de massa disponíveis (rota pública)
app.get('/tipos-massa', async (req, res) => {
    try {
        const tiposMassa = await prisma.tipoMassa.findMany({
            where: { disponivel: true },
            orderBy: { nome: 'asc' }
        });
        res.json(tiposMassa);
    } catch (error) {
        console.error("Erro ao buscar tipos de massa:", error);
        res.status(500).json({ error: 'Erro ao buscar tipos de massa.' });
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

// ======================================================================
// ✅ INÍCIO DA ADIÇÃO DAS NOVAS ROTAS
// ======================================================================

// Editar/Atualizar o nome de uma categoria
app.put('/admin/categoria/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { nome } = req.body;

    if (!nome || nome.trim() === '') {
        return res.status(400).json({ message: 'O nome da categoria é obrigatório.' });
    }

    try {
        const categoriaAtualizada = await prisma.categoria.update({
            where: { id: Number(id) },
            data: { nome: nome.trim() }
        });
        res.json(categoriaAtualizada);
    } catch (error) {
        // Prisma lança um erro se o registro a ser atualizado não for encontrado
        console.error("Erro ao atualizar categoria:", error);
        res.status(404).json({ message: 'Categoria não encontrada.' });
    }
});

// Excluir uma categoria
app.delete('/admin/categoria/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        // Passo 1: Verificar se algum item usa esta categoria
        const itemCount = await prisma.item.count({
            where: { categoriaId: Number(id) }
        });

        // Se houver itens, impede a exclusão e informa o usuário
        if (itemCount > 0) {
            return res.status(400).json({ 
                message: `Não é possível excluir esta categoria, pois ${itemCount} item(ns) estão associados a ela.` 
            });
        }

        // Passo 2: Se não houver itens, exclui a categoria
        await prisma.categoria.delete({
            where: { id: Number(id) }
        });

        res.json({ message: 'Categoria excluída com sucesso.' });
    } catch (error) {
        // Prisma lança um erro se o registro a ser excluído não for encontrado
        console.error("Erro ao excluir categoria:", error);
        res.status(404).json({ message: 'Categoria não encontrada.' });
    }
});

// ======================================================================
// ✅ FIM DA ADIÇÃO
// ======================================================================















// ======================================================================
// ✅ INÍCIO DA ALTERAÇÃO
// ======================================================================

// Adicionar item ao cardápio
app.post('/admin/item', authenticateToken, async (req, res) => {
    // 1. Extrai todos os campos de preço do corpo da requisição
    const {
        nome, descricao, preco, categoriaId, imagemUrl,
        precoP, precoM, precoG, precoGG,
        precoPComBorda, precoMComBorda, precoGComBorda, precoGGComBorda
    } = req.body;

    if (!nome || !preco || !categoriaId) {
        return res.status(400).json({ error: 'Nome, preço e categoria são obrigatórios.' });
    }

    try {
        const item = await prisma.item.create({
            data: {
                nome,
                descricao,
                preco, // O preço principal (base)
                imagemUrl,
                // 2. Adiciona os preços por tamanho (serão salvos como null se não forem enviados)
                precoP,
                precoM,
                precoG,
                precoGG,
                // 3. Adiciona os preços com borda por tamanho
                precoPComBorda,
                precoMComBorda,
                precoGComBorda,
                precoGGComBorda,
                categoria: {
                    connect: { id: Number(categoriaId) }
                }
            }
        });

        res.status(201).json(item);
    } catch (error) {
        console.error("Erro ao criar item:", error);
        res.status(500).json({ error: 'Erro ao criar item. Verifique o ID da categoria.' });
    }
});

// Lista todos os itens pro admin
app.get('/admin/items', authenticateToken, async (req, res) => {
    try {
        const items = await prisma.item.findMany({
            include: {
                categoria: true
            },
            orderBy: [
                { categoriaId: 'asc' },
                { order: 'asc' },
                { id: 'asc' }
            ]
        });
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar itens.' });
    }
});

// Editar item do cardápio
app.put('/admin/item/:id', authenticateToken, async (req, res) => {
    // 1. Extrai todos os campos, incluindo os de pizza
    const {
        nome, descricao, preco, disponivel, imagemUrl,
        precoP, precoM, precoG, precoGG,
        precoPComBorda, precoMComBorda, precoGComBorda, precoGGComBorda
    } = req.body;
    const { id } = req.params;

    try {
        const item = await prisma.item.update({
            where: { id: Number(id) },
            // 2. Inclui todos os campos no objeto 'data' para serem atualizados
            data: {
                nome,
                descricao,
                preco,
                disponivel,
                imagemUrl,
                precoP,
                precoM,
                precoG,
                precoGG,
                precoPComBorda,
                precoMComBorda,
                precoGComBorda,
                precoGGComBorda
            }
        });
        res.json(item);
    } catch(error) {
        console.error("Erro ao editar item:", error);
        res.status(404).json({ error: 'Item não encontrado.' });
    }
});

// ======================================================================
// ✅ FIM DA ALTERAÇÃO
// ======================================================================

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
// ✅ INÍCIO DA ADIÇÃO - ROTA PARA MOVER ITENS (REORDENAR)
// ======================================================================

// Mover item para cima ou para baixo na ordem
app.patch('/admin/item/:id/move', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { direction } = req.body;

    if (!direction || !['up', 'down'].includes(direction)) {
        return res.status(400).json({ error: 'Direção inválida. Use "up" ou "down".' });
    }

    try {
        // Buscar o item atual
        const itemAtual = await prisma.item.findUnique({
            where: { id: Number(id) }
        });

        if (!itemAtual) {
            return res.status(404).json({ error: 'Item não encontrado.' });
        }

        // Buscar todos os itens da mesma categoria ordenados
        const todosItens = await prisma.item.findMany({
            where: { categoriaId: itemAtual.categoriaId },
            orderBy: [
                { order: 'asc' },
                { id: 'asc' }
            ]
        });

        // Encontrar o índice do item atual
        const indiceAtual = todosItens.findIndex(item => item.id === itemAtual.id);

        // Verificar se pode mover
        if (direction === 'up' && indiceAtual === 0) {
            return res.json({
                message: 'Item já está no topo da lista.',
                item: itemAtual
            });
        }

        if (direction === 'down' && indiceAtual === todosItens.length - 1) {
            return res.json({
                message: 'Item já está no final da lista.',
                item: itemAtual
            });
        }

        // Encontrar o item vizinho
        const indiceVizinho = direction === 'up' ? indiceAtual - 1 : indiceAtual + 1;
        const itemVizinho = todosItens[indiceVizinho];

        // Usar valores únicos baseados no índice para evitar duplicatas
        // Se estiverem com mesmo order, precisamos dar valores diferentes
        const novoOrderAtual = indiceVizinho * 10;
        const novoOrderVizinho = indiceAtual * 10;

        // Trocar os valores de order usando uma transação
        await prisma.$transaction([
            prisma.item.update({
                where: { id: itemAtual.id },
                data: { order: novoOrderAtual }
            }),
            prisma.item.update({
                where: { id: itemVizinho.id },
                data: { order: novoOrderVizinho }
            })
        ]);

        // Buscar o item atualizado
        const itemAtualizado = await prisma.item.findUnique({
            where: { id: Number(id) }
        });

        res.json({
            message: 'Item movido com sucesso.',
            item: itemAtualizado
        });

    } catch (error) {
        console.error("Erro ao mover item:", error);
        res.status(500).json({ error: 'Erro ao mover item.' });
    }
});

// ======================================================================
// ✅ FIM DA ADIÇÃO
// ======================================================================

// Listar todos os pedidos finalizados (histórico)
app.get('/admin/pedidos/historico', authenticateToken, async (req, res) => {
    try {
        const pedidos = await prisma.pedido.findMany({
            where: {
                status: 4
            },
            include: {
                itens: {
                    include: {
                        item: true,
                        borda: true,
                        tipoMassa: true
                    }
                }
            },
            orderBy: {
                criadoEm: 'desc'
            }
        });
        res.json(pedidos);
    } catch (error) {
        console.error("Erro ao buscar histórico de pedidos:", error);
        res.status(500).json({ error: 'Erro ao buscar histórico de pedidos.' });
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













// ======================================================================
// ✅ INÍCIO DA ADIÇÃO - ROTAS ADMIN PARA BORDAS
// ======================================================================

// Listar todas as bordas (incluindo indisponíveis) - Admin
app.get('/admin/bordas', authenticateToken, async (req, res) => {
    try {
        const bordas = await prisma.borda.findMany({
            orderBy: { nome: 'asc' }
        });
        res.json(bordas);
    } catch (error) {
        console.error("Erro ao buscar bordas:", error);
        res.status(500).json({ error: 'Erro ao buscar bordas.' });
    }
});

// Criar uma nova borda - Admin
app.post('/admin/borda', authenticateToken, async (req, res) => {
    const { nome, precoP, precoM, precoG, precoGG } = req.body;

    if (!nome || precoP === undefined || precoM === undefined || precoG === undefined || precoGG === undefined) {
        return res.status(400).json({ error: 'Nome e preços para todos os tamanhos são obrigatórios.' });
    }

    try {
        const borda = await prisma.borda.create({
            data: {
                nome,
                precoP: parseFloat(precoP),
                precoM: parseFloat(precoM),
                precoG: parseFloat(precoG),
                precoGG: parseFloat(precoGG),
            }
        });
        res.status(201).json(borda);
    } catch (error) {
        console.error("Erro ao criar borda:", error);
        res.status(500).json({ error: 'Erro ao criar borda.' });
    }
});

// Editar uma borda - Admin
app.put('/admin/borda/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { nome, precoP, precoM, precoG, precoGG, disponivel } = req.body;

    try {
        const borda = await prisma.borda.update({
            where: { id: Number(id) },
            data: {
                nome,
                precoP: parseFloat(precoP),
                precoM: parseFloat(precoM),
                precoG: parseFloat(precoG),
                precoGG: parseFloat(precoGG),
                disponivel
            }
        });
        res.json(borda);
    } catch (error) {
        console.error("Erro ao editar borda:", error);
        res.status(404).json({ error: 'Borda não encontrada.' });
    }
});

// Excluir uma borda - Admin
app.delete('/admin/borda/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.borda.delete({
            where: { id: Number(id) }
        });
        res.json({ message: 'Borda excluída com sucesso.' });
    } catch (error) {
        console.error("Erro ao excluir borda:", error);
        res.status(404).json({ error: 'Borda não encontrada.' });
    }
});

// ======================================================================
// ✅ FIM DA ADIÇÃO
// ======================================================================


// ======================================================================
// ✅ INÍCIO DA ADIÇÃO - ROTAS ADMIN PARA TIPOS DE MASSA
// ======================================================================

// Listar todos os tipos de massa (incluindo indisponíveis) - Admin
app.get('/admin/tipos-massa', authenticateToken, async (req, res) => {
    try {
        const tiposMassa = await prisma.tipoMassa.findMany({
            orderBy: { nome: 'asc' }
        });
        res.json(tiposMassa);
    } catch (error) {
        console.error("Erro ao buscar tipos de massa:", error);
        res.status(500).json({ error: 'Erro ao buscar tipos de massa.' });
    }
});

// Criar um novo tipo de massa - Admin
app.post('/admin/tipo-massa', authenticateToken, async (req, res) => {
    const { nome } = req.body;

    if (!nome) {
        return res.status(400).json({ error: 'Nome do tipo de massa é obrigatório.' });
    }

    try {
        const tipoMassa = await prisma.tipoMassa.create({
            data: { nome }
        });
        res.status(201).json(tipoMassa);
    } catch (error) {
        console.error("Erro ao criar tipo de massa:", error);
        res.status(500).json({ error: 'Erro ao criar tipo de massa.' });
    }
});

// Editar um tipo de massa - Admin
app.put('/admin/tipo-massa/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { nome, disponivel } = req.body;

    try {
        const tipoMassa = await prisma.tipoMassa.update({
            where: { id: Number(id) },
            data: { nome, disponivel }
        });
        res.json(tipoMassa);
    } catch (error) {
        console.error("Erro ao editar tipo de massa:", error);
        res.status(404).json({ error: 'Tipo de massa não encontrado.' });
    }
});

// Excluir um tipo de massa - Admin
app.delete('/admin/tipo-massa/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.tipoMassa.delete({
            where: { id: Number(id) }
        });
        res.json({ message: 'Tipo de massa excluído com sucesso.' });
    } catch (error) {
        console.error("Erro ao excluir tipo de massa:", error);
        res.status(404).json({ error: 'Tipo de massa não encontrado.' });
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



    // ======================================================================
    // ✅ INÍCIO DA ADIÇÃO - LÓGICA PARA POPULAR TAXA DE ENTREGA
    // ======================================================================
    // Inicializar taxa de entrega padrão se não existir
    const totalEntregas = await prisma.entrega.count();
    if (totalEntregas === 0) {
        console.log('Nenhuma taxa de entrega encontrada. Criando taxa padrão...');
        await prisma.entrega.create({
            data: {
                taxaEntrega: 5.00 // Defina um valor padrão
            }
        });
        console.log('Taxa de entrega padrão (R$ 5.00) criada com sucesso.');
    }
    // ======================================================================
    // ✅ FIM DA ADIÇÃO
    // ======================================================================


    // ======================================================================
    // ✅ INÍCIO DA ADIÇÃO - LÓGICA PARA POPULAR BORDAS E TIPOS DE MASSA
    // ======================================================================
    // Inicializar bordas padrão se não existirem
    const totalBordas = await prisma.borda.count();
    if (totalBordas === 0) {
        console.log('Nenhuma borda encontrada. Criando bordas padrão...');
        const defaultBordas = [
            { nome: 'Catupiry', precoP: 3.00, precoM: 4.00, precoG: 5.00, precoGG: 6.00 },
            { nome: 'Cheddar', precoP: 3.50, precoM: 4.50, precoG: 5.50, precoGG: 6.50 },
        ];

        await prisma.borda.createMany({
            data: defaultBordas,
        });
        console.log('Bordas padrão criadas com sucesso.');
    }

    // Inicializar tipos de massa padrão se não existirem
    const totalTiposMassa = await prisma.tipoMassa.count();
    if (totalTiposMassa === 0) {
        console.log('Nenhum tipo de massa encontrado. Criando tipos padrão...');
        const defaultTiposMassa = [
            { nome: 'Fina' },
            { nome: 'Média' },
            { nome: 'Grossa' },
        ];

        await prisma.tipoMassa.createMany({
            data: defaultTiposMassa,
        });
        console.log('Tipos de massa padrão criados com sucesso.');
    }
    // ======================================================================
    // ✅ FIM DA ADIÇÃO
    // ======================================================================
});
