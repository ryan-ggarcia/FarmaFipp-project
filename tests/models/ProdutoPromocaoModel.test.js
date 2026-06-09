/**
 * Testes unitários — ProdutoPromocaoModel
 */

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
    });

    describe('ReadProductExpirationDateNear', () => {
        it('deve retornar false quando não há produtos próximos ao vencimento', async () => {
            mockExecutaComando.mockResolvedValueOnce([]);

            const model = new ProdutoPromocaoModel();
            const result = await model.ReadProductExpirationDateNear();
            expect(result).toBe(false);
        });

        it('deve retornar produtos com preço promocional quando há lotes a vencer', async () => {
            // 1ª chamada: query de produtos próximos ao vencimento
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

            // 2ª chamada: verificação anti-duplicata (sem promoção existente)
            mockExecutaComando.mockResolvedValueOnce([]);

            // 3ª chamada: inserção da promoção
            mockExecutaComandoNonQuery.mockResolvedValueOnce(true);

            const model = new ProdutoPromocaoModel();
            const result = await model.ReadProductExpirationDateNear();

            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(1);
            expect(result[0].nome).toBe('Vitamina C');
            // Preço com 15% desconto: 50 - (50*0.15) = 42.50
            expect(result[0].precoPromocional).toBe('42.50');
        });

        it('não deve duplicar promoção se já existir uma ativa', async () => {
            // 1ª chamada: query de produtos próximos ao vencimento
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

            // 2ª chamada: verificação anti-duplicata (promoção JÁ existe)
            mockExecutaComando.mockResolvedValueOnce([
                { idPromocao: 99, prom_valor: 42.50 }
            ]);

            const model = new ProdutoPromocaoModel();
            const result = await model.ReadProductExpirationDateNear();

            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(1);
            // Não deve ter chamado ExecutaComandoNonQuery (não inseriu duplicata)
            expect(mockExecutaComandoNonQuery).not.toHaveBeenCalled();
            // Preço retornado é o da promoção existente
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
