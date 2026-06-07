/**
 * Testes End-to-End — ProdutoController (/admin/produtos)
 *
 * Cobre todas as rotas do ProdutoRouter:
 *   GET  /                 → listar
 *   GET  /cadastrar        → cadastrarView
 *   POST /cadastrar        → cadastrar
 *   GET  /obter/:produtoId → obterProduto
 *   GET  /alterar/:id      → AlterarView
 *   POST /alterar          → alterar
 *   POST /excluir          → excluir
 */

const {
    mockExecutaComando,
    mockExecutaComandoNonQuery,
    mockExecutaComandoLastInserted
} = require('../setup');

// Mock fs para ProdutoController (alterar usa fs.existsSync/unlinkSync)
// e ProdutoPromocaoModel (usa fs for config)
jest.mock('fs', () => ({
    existsSync: jest.fn(() => false),
    readFileSync: jest.fn(() => '{}'),
    writeFileSync: jest.fn(),
    unlinkSync: jest.fn()
}));

const ProdutoController = require('../../controllers/ProdutoController');

// ─── Helper: mock req/res ─────────────────────────────────────────────
function mockReqRes(body = {}, params = {}, file = null) {
    const req = {
        body,
        params,
        cookies: { usuarioLogado: '1' },
        file
    };
    const res = {
        _status: 200,
        _data: null,
        _rendered: null,
        status(code) { this._status = code; return this; },
        send(data) { this._data = data; return this; },
        render(view, data) { this._rendered = { view, data }; return this; },
        json(data) { this._data = data; return this; }
    };
    return { req, res };
}

// ─── Dados de mock reutilizáveis ──────────────────────────────────────
const PRODUTO_ROW = {
    idProduto: 1,
    pro_nome: 'Vitamina C 500mg',
    descricao: 'Suplemento vitamínico',
    pro_validade: '2026-12-31',
    pro_preco: 29.90,
    pro_quantidade: 100,
    Categoria_Produto: 1,
    cat_nome: 'Vitaminas',
    idFornecedor: 1,
    forn_nome: 'Fornecedor A',
    marca: 'PharmaBrand',
    pro_img: 'PRD-123.jpg',
    prod_status: 'Ativo',
    lot_id: 10,
    lot_name: 'Lote ABC',
    lot_validade: '2026-12-31',
    lot_qnt: 50
};

const CATEGORIA_ROWS = [
    { idCategoria: 1, cat_nome: 'Vitaminas' },
    { idCategoria: 2, cat_nome: 'Analgésicos' }
];

const FORNECEDOR_ROWS = [
    { idFornecedor: 1, forn_nome: 'Fornecedor A', forn_telefone: '11999999999', forn_cnpj: '12345678000100', forn_status: 'ativo' },
    { idFornecedor: 2, forn_nome: 'Fornecedor B', forn_telefone: '11888888888', forn_cnpj: '98765432000100', forn_status: 'ativo' }
];

const LOTE_ROWS = [
    { lot_id: 10, prod_id: 1, lot_validade: '2026-12-31', lot_qnt: 50, forn_id: 1, lot_name: 'Lote ABC' }
];

// =====================================================================
describe('ProdutoController — /admin/produtos', () => {
    const ctrl = new ProdutoController();

    // =================================================================
    // GET / e GET /listar — listar
    // =================================================================
    describe('listar (GET / e GET /listar)', () => {
        it('deve renderizar a view de listagem com produtos, categorias e lotes', async () => {
            // Read() → discardProductsExpired (inner query) + main SELECT
            mockExecutaComando
                .mockResolvedValueOnce([])           // discardProductsExpired query
                .mockResolvedValueOnce(CATEGORIA_ROWS) // ListCategorias
                .mockResolvedValueOnce([PRODUTO_ROW]) // Read
                .mockResolvedValueOnce(LOTE_ROWS);     // Lote.List

            const { req, res } = mockReqRes();
            await ctrl.listar(req, res);

            expect(res._rendered).not.toBeNull();
            expect(res._rendered.view).toBe('produtos/listar');
            expect(res._rendered.data.active).toBe('produtos');
            expect(res._rendered.data).toHaveProperty('lista');
            expect(res._rendered.data).toHaveProperty('categoria');
            expect(res._rendered.data).toHaveProperty('lote');
        });

        it('deve renderizar com lista vazia quando não há produtos', async () => {
            mockExecutaComando
                .mockResolvedValueOnce([])              // discardProductsExpired
                .mockResolvedValueOnce(CATEGORIA_ROWS)  // ListCategorias
                .mockResolvedValueOnce([])              // Read (sem produtos)
                .mockResolvedValueOnce([]);              // Lote.List

            const { req, res } = mockReqRes();
            await ctrl.listar(req, res);

            expect(res._rendered.data.lista).toEqual([]);
        });

        it('deve retornar status 500 quando o banco falha', async () => {
            mockExecutaComando.mockRejectedValueOnce(new Error('DB connection failed'));

            const { req, res } = mockReqRes();
            await ctrl.listar(req, res);

            expect(res._status).toBe(500);
            expect(res._data.ok).toBe(false);
        });
    });

    // =================================================================
    // GET /cadastrar — cadastrarView
    // =================================================================
    describe('cadastrarView (GET /cadastrar)', () => {
        it('deve renderizar a view com categorias e fornecedores', async () => {
            // FornecedorModel.List()
            mockExecutaComando.mockResolvedValueOnce(FORNECEDOR_ROWS);
            // ProdutoModel.ListCategorias() → discardProductsExpired + categorias
            mockExecutaComando.mockResolvedValueOnce([]);              // discard
            mockExecutaComando.mockResolvedValueOnce(CATEGORIA_ROWS);  // categorias

            const { req, res } = mockReqRes();
            await ctrl.cadastrarView(req, res);

            expect(res._rendered.view).toBe('produtos/cadastrar');
            expect(res._rendered.data).toHaveProperty('categorias');
            expect(res._rendered.data).toHaveProperty('fornecedores');
            expect(res._rendered.data.active).toBe('produtos');
        });

        it('deve retornar 500 em caso de erro', async () => {
            mockExecutaComando.mockRejectedValueOnce(new Error('DB error'));

            const { req, res } = mockReqRes();
            await ctrl.cadastrarView(req, res);

            expect(res._status).toBe(500);
        });
    });

    // =================================================================
    // POST /cadastrar — cadastrar
    // =================================================================
    describe('cadastrar (POST /cadastrar)', () => {
        const validBody = {
            nome: 'Paracetamol 750mg',
            descricao: 'Analgésico e antitérmico',
            preco: '12.50',
            quantidade: '200',
            marca: 'GenericPharma',
            categoria: '2',
            fornecedor: '1'
        };

        it('deve cadastrar produto com sucesso e registrar no estoque', async () => {
            // produto.Create() → ExecutaComandoLastInserted
            mockExecutaComandoLastInserted.mockResolvedValueOnce(5);
            // estoque.AddToInventory() → ExecutaComandoLastInserted
            mockExecutaComandoLastInserted.mockResolvedValueOnce(1);

            const { req, res } = mockReqRes(validBody, {}, { filename: 'PRD-999.jpg' });
            await ctrl.cadastrar(req, res);

            expect(res._data.ok).toBe(true);
            expect(res._data.msg).toContain('estoque');
        });

        it('deve cadastrar produto sem imagem', async () => {
            mockExecutaComandoLastInserted.mockResolvedValueOnce(6);
            mockExecutaComandoLastInserted.mockResolvedValueOnce(2);

            const { req, res } = mockReqRes(validBody);
            await ctrl.cadastrar(req, res);

            expect(res._data.ok).toBe(true);
        });

        it('deve recusar quando nome está vazio', async () => {
            const body = { ...validBody, nome: '' };
            const { req, res } = mockReqRes(body);
            await ctrl.cadastrar(req, res);

            expect(res._data.ok).toBe(false);
            expect(res._data.msg).toContain('Preencha');
        });

        it('deve recusar quando nome é apenas espaços', async () => {
            const body = { ...validBody, nome: '   ' };
            const { req, res } = mockReqRes(body);
            await ctrl.cadastrar(req, res);

            expect(res._data.ok).toBe(false);
        });

        it('deve recusar quando descricao está ausente', async () => {
            const body = { ...validBody, descricao: undefined };
            const { req, res } = mockReqRes(body);
            await ctrl.cadastrar(req, res);

            expect(res._data.ok).toBe(false);
        });

        it('deve recusar quando preco é zero', async () => {
            const body = { ...validBody, preco: '0' };
            const { req, res } = mockReqRes(body);
            await ctrl.cadastrar(req, res);

            expect(res._data.ok).toBe(false);
            expect(res._data.msg).toContain('preço');
        });

        it('deve recusar quando preco é negativo', async () => {
            const body = { ...validBody, preco: '-5' };
            const { req, res } = mockReqRes(body);
            await ctrl.cadastrar(req, res);

            expect(res._data.ok).toBe(false);
        });

        it('deve recusar quando preco não é numérico', async () => {
            const body = { ...validBody, preco: 'abc' };
            const { req, res } = mockReqRes(body);
            await ctrl.cadastrar(req, res);

            expect(res._data.ok).toBe(false);
        });

        it('deve recusar quando quantidade é zero', async () => {
            const body = { ...validBody, quantidade: '0' };
            const { req, res } = mockReqRes(body);
            await ctrl.cadastrar(req, res);

            expect(res._data.ok).toBe(false);
            expect(res._data.msg).toContain('quantidade');
        });

        it('deve recusar quando quantidade é negativa', async () => {
            const body = { ...validBody, quantidade: '-10' };
            const { req, res } = mockReqRes(body);
            await ctrl.cadastrar(req, res);

            expect(res._data.ok).toBe(false);
        });

        it('deve recusar quando categoria não é informada', async () => {
            const body = { ...validBody, categoria: '' };
            const { req, res } = mockReqRes(body);
            await ctrl.cadastrar(req, res);

            expect(res._data.ok).toBe(false);
        });

        it('deve recusar quando fornecedor não é informado', async () => {
            const body = { ...validBody, fornecedor: '' };
            const { req, res } = mockReqRes(body);
            await ctrl.cadastrar(req, res);

            expect(res._data.ok).toBe(false);
        });

        it('deve recusar quando marca está vazia', async () => {
            const body = { ...validBody, marca: '' };
            const { req, res } = mockReqRes(body);
            await ctrl.cadastrar(req, res);

            expect(res._data.ok).toBe(false);
        });

        it('deve retornar ok:false quando Create() retorna falsy', async () => {
            mockExecutaComandoLastInserted.mockResolvedValueOnce(0);

            const { req, res } = mockReqRes(validBody);
            await ctrl.cadastrar(req, res);

            expect(res._data.ok).toBe(false);
        });

        it('deve retornar status 500 quando Create() lança exceção', async () => {
            mockExecutaComandoLastInserted.mockRejectedValueOnce(new Error('SQL syntax error'));

            const { req, res } = mockReqRes(validBody);
            await ctrl.cadastrar(req, res);

            expect(res._status).toBe(500);
            expect(res._data.ok).toBe(false);
        });
    });

    // =================================================================
    // GET /obter/:produtoId — obterProduto
    // =================================================================
    describe('obterProduto (GET /obter/:produtoId)', () => {
        it('deve retornar dados do produto com lote e sem promoção', async () => {
            const fs = require('fs');
            fs.existsSync.mockReturnValue(false);

            // produto.Get() query
            mockExecutaComando.mockResolvedValueOnce([PRODUTO_ROW]);
            // produto.GetLote()
            mockExecutaComando.mockResolvedValueOnce([{ lot_id: 10, lot_qnt: 50 }]);
            // promoModel.GetPromocaoByProdutoId()
            mockExecutaComando.mockResolvedValueOnce([]);

            const { req, res } = mockReqRes({}, { produtoId: '1' });
            await ctrl.obterProduto(req, res);

            expect(res._data.ok).toBe(true);
            expect(res._data.produto.id).toBe(1);
            expect(res._data.produto.id_lote).toBe(10);
            expect(res._data.produto).not.toHaveProperty('precoPromocional');
        });

        it('deve retornar produto com preço promocional quando existe promoção', async () => {
            const fs = require('fs');
            fs.existsSync.mockReturnValue(false);

            mockExecutaComando.mockResolvedValueOnce([PRODUTO_ROW]);
            mockExecutaComando.mockResolvedValueOnce([{ lot_id: 10, lot_qnt: 50 }]);
            mockExecutaComando.mockResolvedValueOnce([{
                idPromocao: 1,
                prom_valor: 25.42,
                prom_porcentagem: 15,
                prom_dataFinal: '2026-08-01'
            }]);

            const { req, res } = mockReqRes({}, { produtoId: '1' });
            await ctrl.obterProduto(req, res);

            expect(res._data.ok).toBe(true);
            expect(res._data.produto.precoPromocional).toBe(25.42);
            expect(res._data.produto.porcentagemDesconto).toBe(15);
        });

        it('deve retornar 400 quando produtoId não informado', async () => {
            const { req, res } = mockReqRes({}, {});
            await ctrl.obterProduto(req, res);

            expect(res._status).toBe(400);
            expect(res._data.ok).toBe(false);
        });

        it('deve retornar 404 quando produto não encontrado', async () => {
            mockExecutaComando.mockResolvedValueOnce([]);

            const { req, res } = mockReqRes({}, { produtoId: '999' });
            await ctrl.obterProduto(req, res);

            expect(res._status).toBe(404);
            expect(res._data.ok).toBe(false);
        });

        it('deve retornar id_lote null quando não há lotes', async () => {
            const fs = require('fs');
            fs.existsSync.mockReturnValue(false);

            mockExecutaComando.mockResolvedValueOnce([PRODUTO_ROW]);
            mockExecutaComando.mockResolvedValueOnce([]);   // sem lotes
            mockExecutaComando.mockResolvedValueOnce([]);    // sem promo

            const { req, res } = mockReqRes({}, { produtoId: '1' });
            await ctrl.obterProduto(req, res);

            expect(res._data.produto.id_lote).toBeNull();
        });

        it('deve retornar status 500 em caso de exceção', async () => {
            mockExecutaComando.mockRejectedValueOnce(new Error('Connection lost'));

            const { req, res } = mockReqRes({}, { produtoId: '1' });
            await ctrl.obterProduto(req, res);

            expect(res._status).toBe(500);
        });
    });

    // =================================================================
    // GET /alterar/:id — AlterarView
    // =================================================================
    describe('AlterarView (GET /alterar/:id)', () => {
        it('deve renderizar a view de alteração com dados do produto', async () => {
            const fs = require('fs');
            fs.existsSync.mockReturnValue(true);

            // produto.Get()
            mockExecutaComando.mockResolvedValueOnce([PRODUTO_ROW]);
            // ListCategorias: discard + categorias
            mockExecutaComando.mockResolvedValueOnce([]);
            mockExecutaComando.mockResolvedValueOnce(CATEGORIA_ROWS);
            // FornecedorModel.List()
            mockExecutaComando.mockResolvedValueOnce(FORNECEDOR_ROWS);

            const { req, res } = mockReqRes({}, { id: '1' });
            await ctrl.AlterarView(req, res);

            expect(res._rendered.view).toBe('produtos/alterar');
            expect(res._rendered.data).toHaveProperty('produto');
            expect(res._rendered.data).toHaveProperty('categorias');
            expect(res._rendered.data).toHaveProperty('fornecedores');
            expect(res._rendered.data.active).toBe('produtos');
        });

        it('deve retornar 400 quando id não informado', async () => {
            const { req, res } = mockReqRes({}, {});
            await ctrl.AlterarView(req, res);

            expect(res._status).toBe(400);
        });

        it('deve retornar 404 quando produto não encontrado', async () => {
            mockExecutaComando.mockResolvedValueOnce([]); // Get retorna []

            const { req, res } = mockReqRes({}, { id: '999' });
            await ctrl.AlterarView(req, res);

            expect(res._status).toBe(404);
        });

        it('deve retornar 500 em caso de exceção', async () => {
            mockExecutaComando.mockRejectedValueOnce(new Error('DB error'));

            const { req, res } = mockReqRes({}, { id: '1' });
            await ctrl.AlterarView(req, res);

            expect(res._status).toBe(500);
        });
    });

    // =================================================================
    // POST /alterar — alterar
    // =================================================================
    describe('alterar (POST /alterar)', () => {
        const validAlterarBody = {
            id: '1',
            nome: 'Vitamina C 1000mg',
            descricao: 'Suplemento vitamínico atualizado',
            preco: '39.90',
            quantidade: '150',
            marca: 'PharmaBrand',
            categoria: '1',
            fornecedor: '1'
        };

        it('deve alterar produto com sucesso sem nova imagem', async () => {
            const fs = require('fs');
            fs.existsSync.mockReturnValue(true);

            // produto.Get() para verificar se existe
            mockExecutaComando.mockResolvedValueOnce([PRODUTO_ROW]);
            // produto.Update()
            mockExecutaComando.mockResolvedValueOnce({ affectedRows: 1 });

            const { req, res } = mockReqRes(validAlterarBody);
            await ctrl.alterar(req, res);

            expect(res._data.ok).toBe(true);
            expect(res._data.msg).toContain('alterado');
        });

        it('deve alterar produto com nova imagem e remover imagem antiga', async () => {
            const fs = require('fs');
            fs.existsSync.mockReturnValue(true);

            // produto.Get()
            mockExecutaComando.mockResolvedValueOnce([{
                ...PRODUTO_ROW,
                pro_img: 'PRD-old.jpg'
            }]);
            // produto.Update()
            mockExecutaComando.mockResolvedValueOnce({ affectedRows: 1 });

            const { req, res } = mockReqRes(validAlterarBody, {}, { filename: 'PRD-new.jpg' });
            await ctrl.alterar(req, res);

            expect(res._data.ok).toBe(true);
            expect(fs.unlinkSync).toHaveBeenCalled();
        });

        it('deve recusar quando id não é informado', async () => {
            const body = { ...validAlterarBody, id: '' };
            const { req, res } = mockReqRes(body);
            await ctrl.alterar(req, res);

            expect(res._data.ok).toBe(false);
            expect(res._data.msg).toContain('Preencha');
        });

        it('deve recusar quando nome está vazio', async () => {
            const body = { ...validAlterarBody, nome: '' };
            const { req, res } = mockReqRes(body);
            await ctrl.alterar(req, res);

            expect(res._data.ok).toBe(false);
        });

        it('deve recusar quando preco é zero', async () => {
            const body = { ...validAlterarBody, preco: '0' };
            const { req, res } = mockReqRes(body);
            await ctrl.alterar(req, res);

            expect(res._data.ok).toBe(false);
        });

        it('deve recusar quando preco é negativo', async () => {
            const body = { ...validAlterarBody, preco: '-10' };
            const { req, res } = mockReqRes(body);
            await ctrl.alterar(req, res);

            expect(res._data.ok).toBe(false);
        });

        it('deve recusar quando quantidade é zero', async () => {
            const body = { ...validAlterarBody, quantidade: '0' };
            const { req, res } = mockReqRes(body);
            await ctrl.alterar(req, res);

            expect(res._data.ok).toBe(false);
        });

        it('deve retornar 404 quando produto não existe', async () => {
            mockExecutaComando.mockResolvedValueOnce([]); // Get → not found

            const { req, res } = mockReqRes(validAlterarBody);
            await ctrl.alterar(req, res);

            expect(res._status).toBe(404);
        });

        it('deve retornar ok:false quando Update() retorna falsy', async () => {
            const fs = require('fs');
            fs.existsSync.mockReturnValue(true);

            mockExecutaComando.mockResolvedValueOnce([PRODUTO_ROW]);
            mockExecutaComando.mockResolvedValueOnce(null); // Update falha

            const { req, res } = mockReqRes(validAlterarBody);
            await ctrl.alterar(req, res);

            expect(res._data.ok).toBe(false);
        });

        it('deve retornar 500 quando Update() lança exceção', async () => {
            mockExecutaComando.mockRejectedValueOnce(new Error('Deadlock'));

            const { req, res } = mockReqRes(validAlterarBody);
            await ctrl.alterar(req, res);

            expect(res._status).toBe(500);
        });
    });

    // =================================================================
    // POST /excluir — excluir
    // =================================================================
    describe('excluir (POST /excluir)', () => {
        it('deve inativar produto com sucesso (id via body)', async () => {
            mockExecutaComando.mockResolvedValueOnce({ affectedRows: 1 });

            const { req, res } = mockReqRes({ id: '1' });
            await ctrl.excluir(req, res);

            expect(res._data.ok).toBe(true);
            expect(res._data.msg).toContain('inativado');
        });

        it('deve inativar produto com sucesso (id via params)', async () => {
            mockExecutaComando.mockResolvedValueOnce({ affectedRows: 1 });

            const { req, res } = mockReqRes({}, { id: '2' });
            await ctrl.excluir(req, res);

            expect(res._data.ok).toBe(true);
        });

        it('deve retornar ok:false quando id não é informado', async () => {
            const { req, res } = mockReqRes({}, {});
            await ctrl.excluir(req, res);

            expect(res._data.ok).toBe(false);
            expect(res._data.msg).toContain('ID');
        });

        it('deve retornar ok:false quando Delete() retorna falsy', async () => {
            mockExecutaComando.mockResolvedValueOnce(null);

            const { req, res } = mockReqRes({ id: '1' });
            await ctrl.excluir(req, res);

            expect(res._data.ok).toBe(false);
        });

        it('deve retornar 500 quando Delete() lança exceção', async () => {
            mockExecutaComando.mockRejectedValueOnce(new Error('FK constraint'));

            const { req, res } = mockReqRes({ id: '1' });
            await ctrl.excluir(req, res);

            expect(res._status).toBe(500);
        });
    });
});
