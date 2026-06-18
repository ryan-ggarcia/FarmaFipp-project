const { mockExecutaComando, mockExecutaComandoNonQuery } = require('../setup');

const ProdutoPromocaoModel = require('../../models/ProdutoPromocaoModel');

describe('ProdutoPromocaoModel', () => {

    describe('GetDescontoAtual', () => {
        it('deve retornar 15 como padrão quando config não existe no banco', async () => {
            mockExecutaComando.mockResolvedValueOnce([]);

            const desconto = await ProdutoPromocaoModel.GetDescontoAtual();
            expect(desconto).toBe(15);
        });

        it('deve retornar o valor armazenado no banco', async () => {
            mockExecutaComando.mockResolvedValueOnce([{ valor: '20' }]);

            const desconto = await ProdutoPromocaoModel.GetDescontoAtual();
            expect(desconto).toBe(20);
        });

        it('deve retornar 15 se o banco contém valor inválido', async () => {
            mockExecutaComando.mockResolvedValueOnce([{ valor: '-5' }]);

            const desconto = await ProdutoPromocaoModel.GetDescontoAtual();
            expect(desconto).toBe(15);
        });
    });

    describe('SetDesconto', () => {
        it('deve salvar o desconto no banco e retornar true', async () => {
            mockExecutaComandoNonQuery.mockResolvedValueOnce(true);

            const result = await ProdutoPromocaoModel.SetDesconto(25);
            expect(result).toBe(true);
            expect(mockExecutaComandoNonQuery).toHaveBeenCalled();
        });

        it('deve retornar false para valor inválido (0)', async () => {
            const result = await ProdutoPromocaoModel.SetDesconto(0);
            expect(result).toBe(false);
        });

        it('deve retornar false para valor inválido (101)', async () => {
            const result = await ProdutoPromocaoModel.SetDesconto(101);
            expect(result).toBe(false);
        });

        it('deve retornar false para valor NaN', async () => {
            const result = await ProdutoPromocaoModel.SetDesconto('abc');
            expect(result).toBe(false);
        });

        it('deve propagar o novo desconto para as promoções ativas', async () => {
            mockExecutaComandoNonQuery.mockResolvedValueOnce(true);
            mockExecutaComandoNonQuery.mockResolvedValueOnce(true);

            const result = await ProdutoPromocaoModel.SetDesconto(20);

            expect(result).toBe(true);
            const ultimaChamada = mockExecutaComandoNonQuery.mock.calls[mockExecutaComandoNonQuery.mock.calls.length - 1];
            expect(ultimaChamada[0]).toContain('UPDATE promocao');
            expect(ultimaChamada[0]).toContain('prom_porcentagem');
            expect(ultimaChamada[0]).toContain('prom_valor');
            expect(ultimaChamada[1]).toEqual([20, 20]);
        });
    });

    describe('AplicarDescontoEmPromocoesAtivas', () => {
        it('recalcula preço e porcentagem das promoções ativas', async () => {
            mockExecutaComandoNonQuery.mockResolvedValueOnce(true);

            const result = await ProdutoPromocaoModel.AplicarDescontoEmPromocoesAtivas(20);

            expect(result).toBe(true);
            const [sql, values] = mockExecutaComandoNonQuery.mock.calls[0];
            expect(sql).toContain('UPDATE promocao');
            expect(sql).toContain('prom_valor');
            expect(values).toEqual([20, 20]);
        });

        it('só atualiza promoções de produtos ativos e ainda vigentes', async () => {
            mockExecutaComandoNonQuery.mockResolvedValueOnce(true);

            await ProdutoPromocaoModel.AplicarDescontoEmPromocoesAtivas(20);

            const sql = mockExecutaComandoNonQuery.mock.calls[0][0];
            expect(sql).toContain('prom_dataFinal >= CURDATE()');
            expect(sql).toContain("coalesce(p.prod_status, 'Ativo') = 'Ativo'");
        });

        it('rejeita percentual inválido sem tocar no banco', async () => {
            const r1 = await ProdutoPromocaoModel.AplicarDescontoEmPromocoesAtivas(0);
            const r2 = await ProdutoPromocaoModel.AplicarDescontoEmPromocoesAtivas(150);

            expect(r1).toBe(false);
            expect(r2).toBe(false);
            expect(mockExecutaComandoNonQuery).not.toHaveBeenCalled();
        });
    });

    describe('ReadProductExpirationDateNear', () => {
        it('deve retornar false quando não há produtos próximos ao vencimento', async () => {
            mockExecutaComando.mockResolvedValueOnce([]);

            const model = new ProdutoPromocaoModel();
            const result = await model.ReadProductExpirationDateNear();
            expect(result).toBe(false);
        });

        it('deve retornar produtos com preço promocional quando há lotes a vencer', async () => {
            mockExecutaComando.mockResolvedValueOnce([
                {
                    idProduto: 1,
                    pro_nome: 'Vitamina C',
                    descricao: 'Suplemento',
                    lot_validade: new Date('2026-08-01'),
                    pro_preco: 50.00,
                    pro_quantidade: 100,
                    categoria_nome: 'Vitaminas',
                    idFornecedor: 1,
                    marca: 'VitaPlus',
                    pro_img: 'vitc.jpg'
                }
            ]);

            mockExecutaComando.mockResolvedValueOnce([]);

            mockExecutaComandoNonQuery.mockResolvedValueOnce(true);

            const model = new ProdutoPromocaoModel();
            const result = await model.ReadProductExpirationDateNear();

            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(1);
            expect(result[0].nome).toBe('Vitamina C');
            expect(result[0].precoPromocional).toBe('42.50');
        });

        it('não deve duplicar promoção se já existir uma ativa', async () => {
            mockExecutaComando.mockResolvedValueOnce([
                {
                    idProduto: 1,
                    pro_nome: 'Vitamina C',
                    descricao: 'Suplemento',
                    lot_validade: new Date('2026-08-01'),
                    pro_preco: 50.00,
                    pro_quantidade: 100,
                    categoria_nome: 'Vitaminas',
                    idFornecedor: 1,
                    marca: 'VitaPlus',
                    pro_img: 'vitc.jpg'
                }
            ]);

            mockExecutaComando.mockResolvedValueOnce([
                { idPromocao: 99, prom_valor: 42.50 }
            ]);

            const model = new ProdutoPromocaoModel();
            const result = await model.ReadProductExpirationDateNear();

            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(1);
            expect(mockExecutaComandoNonQuery).not.toHaveBeenCalled();
            expect(result[0].precoPromocional).toBe('42.50');
        });
    });

    describe('ReadPromocoes', () => {
        it('deve retornar array vazio quando não há promoções', async () => {
            mockExecutaComando.mockResolvedValueOnce([]);

            const model = new ProdutoPromocaoModel();
            const result = await model.ReadPromocoes();
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(0);
        });

        it('deve retornar promoções formatadas com dados do produto', async () => {
            mockExecutaComando.mockResolvedValueOnce([
                {
                    idPromocao: 1,
                    prom_dataInicio: '2026-06-01',
                    prom_dataFinal: '2026-08-01',
                    prom_valor: 42.50,
                    prom_porcentagem: 15,
                    idProduto: 1,
                    pro_nome: 'Vitamina C',
                    pro_preco: 50.00,
                    pro_img: 'vitc.jpg',
                    pro_quantidade: 100,
                    cat_nome: 'Vitaminas',
                    marca: 'VitaPlus',
                    lot_validade: '2026-08-01',
                    lot_id: 5
                }
            ]);

            const model = new ProdutoPromocaoModel();
            const result = await model.ReadPromocoes();

            expect(result.length).toBe(1);
            expect(result[0].nomeProduto).toBe('Vitamina C');
            expect(result[0].precoOriginal).toBe(50);
            expect(result[0].precoPromocional).toBe(42.50);
            expect(result[0].porcentagem).toBe(15);
        });
    });

    describe('GetPromocaoByProdutoId', () => {
        it('deve retornar null quando não há promoção ativa', async () => {
            mockExecutaComando.mockResolvedValueOnce([]);

            const model = new ProdutoPromocaoModel();
            const result = await model.GetPromocaoByProdutoId(999);
            expect(result).toBeNull();
        });

        it('deve retornar dados da promoção ativa', async () => {
            mockExecutaComando.mockResolvedValueOnce([
                {
                    idPromocao: 1,
                    prom_valor: 42.50,
                    prom_porcentagem: 15,
                    prom_dataFinal: '2026-08-01'
                }
            ]);

            const model = new ProdutoPromocaoModel();
            const result = await model.GetPromocaoByProdutoId(1);

            expect(result).not.toBeNull();
            expect(result.precoPromocional).toBe(42.50);
            expect(result.porcentagem).toBe(15);
        });
    });

    describe('RemoverPromocao', () => {
        it('deve retornar true ao remover com sucesso', async () => {
            mockExecutaComandoNonQuery.mockResolvedValueOnce(true);

            const model = new ProdutoPromocaoModel();
            const result = await model.RemoverPromocao(1);
            expect(result).toBe(true);
        });

        it('deve retornar false quando a promoção não existe', async () => {
            mockExecutaComandoNonQuery.mockResolvedValueOnce(false);

            const model = new ProdutoPromocaoModel();
            const result = await model.RemoverPromocao(999);
            expect(result).toBe(false);
        });
    });
});
