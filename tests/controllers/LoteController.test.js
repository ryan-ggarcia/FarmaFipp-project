/**
 * Testes End-to-End — LoteController (/admin/produtos/cadastrarLote)
 *
 * Cobre as rotas:
 *   GET  /cadastrarLote → CadastroLoteView
 *   POST /cadastrarLote → CadastroLote
 */

const {
    mockExecutaComando,
    mockExecutaComandoNonQuery,
    mockExecutaComandoLastInserted
} = require('../setup');

const LoteController = require('../../controllers/LoteController');

// ─── Helper: mock req/res ─────────────────────────────────────────────
function mockReqRes(body = {}, params = {}) {
    const req = {
        body,
        params,
        cookies: { usuarioLogado: '1' }
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

// ─── Dados reutilizáveis ─────────────────────────────────────────────
const PRODUTO_ROWS = [
    { idProduto: 1, pro_nome: 'Vitamina C', pro_preco: 29.90 }
];

const FORNECEDOR_ROWS = [
    { idFornecedor: 1, forn_nome: 'Fornecedor A', forn_telefone: '11999', forn_cnpj: '12345678000100', forn_status: 'ativo' }
];

// Data futura para validade
const FUTURE_DATE = new Date();
FUTURE_DATE.setFullYear(FUTURE_DATE.getFullYear() + 1);
const FUTURE_DATE_STR = FUTURE_DATE.toISOString().split('T')[0];

// Data passada
const PAST_DATE = '2020-01-01';

// =====================================================================
describe('LoteController — /admin/produtos (lote)', () => {
    const ctrl = new LoteController();

    // =================================================================
    // GET /cadastrarLote — CadastroLoteView
    // =================================================================
    describe('CadastroLoteView (GET /cadastrarLote)', () => {
        it('deve renderizar a view com produtos e fornecedores', async () => {
            // ProdutoModel.Read() → discardExpired + categorias + Read
            mockExecutaComando.mockResolvedValueOnce([]);             // discard
            mockExecutaComando.mockResolvedValueOnce([]);             // categorias (ListCategorias internamente)
            mockExecutaComando.mockResolvedValueOnce(PRODUTO_ROWS);  // Read
            // FornecedorModel.List()
            mockExecutaComando.mockResolvedValueOnce(FORNECEDOR_ROWS);

            const { req, res } = mockReqRes();
            await ctrl.CadastroLoteView(req, res);

            expect(res._rendered).not.toBeNull();
            expect(res._rendered.view).toBe('produtos/cadastrarLote');
            expect(res._rendered.data).toHaveProperty('produtos');
            expect(res._rendered.data).toHaveProperty('fornecedores');
            expect(res._rendered.data.active).toBe('produtos');
        });

        it('deve retornar 500 em caso de exceção', async () => {
            mockExecutaComando.mockRejectedValueOnce(new Error('DB error'));

            const { req, res } = mockReqRes();
            await ctrl.CadastroLoteView(req, res);

            expect(res._status).toBe(500);
            expect(res._data.ok).toBe(false);
        });
    });

    // =================================================================
    // POST /cadastrarLote — CadastroLote
    // =================================================================
    describe('CadastroLote (POST /cadastrarLote)', () => {
        const validBody = {
            nome: 'Lote Teste',
            validade: FUTURE_DATE_STR,
            quantidade: '50',
            produto: '1',
            fornecedor: '1'
        };

        it('deve cadastrar lote com produto único com sucesso', async () => {
            // LoteModel.Create() → ExecutaComandoLastInserted
            mockExecutaComandoLastInserted.mockResolvedValueOnce(10);
            // #CreateRelationWithProduto → ExecutaComandoNonQuery
            mockExecutaComandoNonQuery.mockResolvedValueOnce(true);
            // #CreateRelationWithFornecedor → ExecutaComandoNonQuery
            mockExecutaComandoNonQuery.mockResolvedValueOnce(true);

            const { req, res } = mockReqRes(validBody);
            await ctrl.CadastroLote(req, res);

            expect(res._data.ok).toBe(true);
            expect(res._data.msg).toContain('sucesso');
        });

        it('deve cadastrar lote com múltiplos produtos (array)', async () => {
            const body = { ...validBody, produto: ['1', '2'] };

            mockExecutaComandoLastInserted.mockResolvedValueOnce(11);
            // 2 relações com produto
            mockExecutaComandoNonQuery.mockResolvedValueOnce(true);
            mockExecutaComandoNonQuery.mockResolvedValueOnce(true);
            // 1 relação com fornecedor
            mockExecutaComandoNonQuery.mockResolvedValueOnce(true);

            const { req, res } = mockReqRes(body);
            await ctrl.CadastroLote(req, res);

            expect(res._data.ok).toBe(true);
        });

        it('deve recusar quando nome está vazio', async () => {
            const body = { ...validBody, nome: '' };
            const { req, res } = mockReqRes(body);
            await ctrl.CadastroLote(req, res);

            expect(res._data.ok).toBe(false);
            expect(res._data.msg).toContain('Preencha');
        });

        it('deve recusar quando nome é apenas espaços', async () => {
            const body = { ...validBody, nome: '   ' };
            const { req, res } = mockReqRes(body);
            await ctrl.CadastroLote(req, res);

            expect(res._data.ok).toBe(false);
        });

        it('deve recusar quando validade está ausente', async () => {
            const body = { ...validBody, validade: '' };
            const { req, res } = mockReqRes(body);
            await ctrl.CadastroLote(req, res);

            expect(res._data.ok).toBe(false);
        });

        it('deve recusar quando validade é uma data passada', async () => {
            const body = { ...validBody, validade: PAST_DATE };
            const { req, res } = mockReqRes(body);
            await ctrl.CadastroLote(req, res);

            expect(res._data.ok).toBe(false);
            expect(res._data.msg).toContain('data futura');
        });

        it('deve recusar quando quantidade é zero', async () => {
            const body = { ...validBody, quantidade: '0' };
            const { req, res } = mockReqRes(body);
            await ctrl.CadastroLote(req, res);

            expect(res._data.ok).toBe(false);
            expect(res._data.msg).toContain('quantidade');
        });

        it('deve recusar quando quantidade é negativa', async () => {
            const body = { ...validBody, quantidade: '-5' };
            const { req, res } = mockReqRes(body);
            await ctrl.CadastroLote(req, res);

            expect(res._data.ok).toBe(false);
        });

        it('deve recusar quando quantidade não é numérica', async () => {
            const body = { ...validBody, quantidade: 'abc' };
            const { req, res } = mockReqRes(body);
            await ctrl.CadastroLote(req, res);

            expect(res._data.ok).toBe(false);
        });

        it('deve recusar quando produto não é informado', async () => {
            const body = { ...validBody, produto: undefined };
            const { req, res } = mockReqRes(body);
            await ctrl.CadastroLote(req, res);

            expect(res._data.ok).toBe(false);
        });

        it('deve recusar quando produto é array vazio', async () => {
            const body = { ...validBody, produto: [] };
            const { req, res } = mockReqRes(body);
            await ctrl.CadastroLote(req, res);

            expect(res._data.ok).toBe(false);
        });

        it('deve recusar quando fornecedor não é informado', async () => {
            const body = { ...validBody, fornecedor: '' };
            const { req, res } = mockReqRes(body);
            await ctrl.CadastroLote(req, res);

            expect(res._data.ok).toBe(false);
        });

        it('deve retornar 500 quando Create() retorna string de erro', async () => {
            mockExecutaComandoLastInserted.mockResolvedValueOnce(12);
            // Relação com produto falha
            mockExecutaComandoNonQuery.mockResolvedValueOnce(false);

            const { req, res } = mockReqRes(validBody);
            await ctrl.CadastroLote(req, res);

            expect(res._status).toBe(500);
            expect(res._data.ok).toBe(false);
        });

        it('deve retornar 500 quando Create() lança exceção', async () => {
            mockExecutaComandoLastInserted.mockRejectedValueOnce(new Error("Column count doesn't match"));

            const { req, res } = mockReqRes(validBody);
            await ctrl.CadastroLote(req, res);

            expect(res._status).toBe(500);
            expect(res._data.ok).toBe(false);
        });
    });
});
