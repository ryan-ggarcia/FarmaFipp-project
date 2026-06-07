/**
 * Testes unitários — PromocaoController (painel admin)
 */

const { mockExecutaComando, mockExecutaComandoNonQuery } = require('../setup');

// Mock do fs para config de desconto
jest.mock('fs', () => ({
    existsSync: jest.fn(() => false),
    readFileSync: jest.fn(() => '{}'),
    writeFileSync: jest.fn()
}));

const PromocaoController = require('../../controllers/PromocaoController');

function mockReqRes(body = {}, params = {}) {
    const req = { body, params, cookies: { usuarioLogado: '1' } };
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

describe('PromocaoController', () => {
    const ctrl = new PromocaoController();

    describe('listarView', () => {
        it('deve renderizar a view de promoções com dados', async () => {
            mockExecutaComando.mockResolvedValueOnce([
                {
                    idPromocao: 1,
                    prom_dataInicio: '2026-06-01',
                    prom_dataFinal: '2026-08-01',
                    prom_valor: 42.50,
                    prom_porcentagem: 15,
                    idProduto: 1,
                    pro_nome: 'Vitamina C',
                    pro_preco: 50,
                    pro_img: null,
                    cat_nome: 'Vitaminas',
                    lot_validade: '2026-08-01',
                    status: 'Ativa'
                }
            ]);

            const { req, res } = mockReqRes();
            await ctrl.listarView(req, res);

            expect(res._rendered).not.toBeNull();
            expect(res._rendered.view).toBe('promocoes/listar');
            expect(res._rendered.data.promocoes.length).toBe(1);
            expect(res._rendered.data.descontoAtual).toBe(15);
            expect(res._rendered.data.active).toBe('promocoes');
        });

        it('deve renderizar com array vazio quando não há promoções', async () => {
            mockExecutaComando.mockResolvedValueOnce([]);

            const { req, res } = mockReqRes();
            await ctrl.listarView(req, res);

            expect(res._rendered.data.promocoes).toEqual([]);
        });
    });

    describe('alterarDesconto', () => {
        it('deve retornar ok:true ao alterar desconto válido', async () => {
            const fs = require('fs');
            fs.writeFileSync.mockImplementation(() => {});

            const { req, res } = mockReqRes({ percentual: 20 });
            await ctrl.alterarDesconto(req, res);

            expect(res._data.ok).toBe(true);
            expect(res._data.msg).toContain('20%');
        });

        it('deve retornar ok:false para percentual inválido (0)', async () => {
            const { req, res } = mockReqRes({ percentual: 0 });
            await ctrl.alterarDesconto(req, res);

            expect(res._data.ok).toBe(false);
        });

        it('deve retornar ok:false para percentual > 100', async () => {
            const { req, res } = mockReqRes({ percentual: 150 });
            await ctrl.alterarDesconto(req, res);

            expect(res._data.ok).toBe(false);
        });
    });

    describe('removerPromocao', () => {
        it('deve retornar ok:true ao remover promoção existente', async () => {
            mockExecutaComandoNonQuery.mockResolvedValueOnce(true);

            const { req, res } = mockReqRes({ id: 1 });
            await ctrl.removerPromocao(req, res);

            expect(res._data.ok).toBe(true);
        });

        it('deve retornar ok:false quando id não informado', async () => {
            const { req, res } = mockReqRes({});
            await ctrl.removerPromocao(req, res);

            expect(res._data.ok).toBe(false);
            expect(res._data.msg).toContain('não informado');
        });

        it('deve retornar ok:false quando promoção não encontrada', async () => {
            mockExecutaComandoNonQuery.mockResolvedValueOnce(false);

            const { req, res } = mockReqRes({ id: 999 });
            await ctrl.removerPromocao(req, res);

            expect(res._data.ok).toBe(false);
        });
    });

    describe('executarPromocaoAutomatica', () => {
        it('deve retornar ok:true com contagem de produtos em promoção', async () => {
            // ReadProductExpirationDateNear: query produtos
            mockExecutaComando.mockResolvedValueOnce([
                {
                    idProduto: 1, pro_nome: 'Test', descricao: '', lot_validade: new Date(),
                    pro_preco: 100, pro_quantidade: 50, categoria_nome: 'Cat',
                    idFornecedor: 1, marca: 'Marca', pro_img: null
                }
            ]);
            // anti-duplicata check
            mockExecutaComando.mockResolvedValueOnce([]);
            // insert promoção
            mockExecutaComandoNonQuery.mockResolvedValueOnce(true);

            const { req, res } = mockReqRes();
            await ctrl.executarPromocaoAutomatica(req, res);

            expect(res._data.ok).toBe(true);
            expect(res._data.msg).toContain('1 produto');
        });

        it('deve retornar ok:true com mensagem de nenhum produto novo', async () => {
            mockExecutaComando.mockResolvedValueOnce([]);

            const { req, res } = mockReqRes();
            await ctrl.executarPromocaoAutomatica(req, res);

            expect(res._data.ok).toBe(true);
            expect(res._data.msg).toContain('Nenhum produto novo');
        });
    });
});
