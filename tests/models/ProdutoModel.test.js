/**
 * Testes unitários para ProdutoModel
 * 
 * Testa os métodos Create(), ListCategorias() e a lógica
 * de descarte automático de produtos vencidos.
 */

const { mockExecutaComando, mockExecutaComandoNonQuery, mockExecutaComandoLastInserted } = require('../setup');
const ProdutoModel = require('../../models/ProdutoModel');

describe('ProdutoModel', () => {

    describe('constructor', () => {
        it('deve criar uma instância com todos os campos corretamente', () => {
            const produto = new ProdutoModel(
                1, 'Dipirona', 'Analgésico', '2026-12-31',
                15.99, 100, 'Medicamentos', 1, 'Genérico', 'LOTE-001', 'dipirona.png'
            );

            expect(produto.id).toBe(1);
            expect(produto.nome).toBe('Dipirona');
            expect(produto.descricao).toBe('Analgésico');
            expect(produto.validade).toBe('2026-12-31');
            expect(produto.preco).toBe(15.99);
            expect(produto.quantidade).toBe(100);
            expect(produto.categoria).toBe('Medicamentos');
            expect(produto.fornecedor).toBe(1);
            expect(produto.marca).toBe('Genérico');
            expect(produto.lote).toBe('LOTE-001');
            expect(produto.img).toBe('dipirona.png');
        });

        it('deve criar uma instância com campos nulos', () => {
            const produto = new ProdutoModel(
                null, null, null, null, null, null, null, null, null, null, null
            );

            expect(produto.id).toBeNull();
            expect(produto.nome).toBeNull();
        });
    });

    describe('getters e setters', () => {
        it('deve permitir atualizar valores via setters', () => {
            const produto = new ProdutoModel(
                1, 'Teste', '', '', 0, 0, '', 0, '', '', ''
            );

            produto.nome = 'Novo Nome';
            produto.preco = 29.99;
            produto.quantidade = 50;

            expect(produto.nome).toBe('Novo Nome');
            expect(produto.preco).toBe(29.99);
            expect(produto.quantidade).toBe(50);
        });
    });

    describe('Create()', () => {
        it('deve inserir um produto no banco e retornar o ID inserido', async () => {
            mockExecutaComandoLastInserted.mockResolvedValue(42);

            const produto = new ProdutoModel(
                0, 'Amoxicilina', 'Antibiótico', '2027-06-30',
                25.50, 200, 'Antibióticos', 3, 'EMS', null, 'amoxicilina.png'
            );

            const result = await produto.Create();

            expect(result).toBe(42);
            expect(mockExecutaComandoLastInserted).toHaveBeenCalledTimes(1);
            expect(mockExecutaComandoLastInserted).toHaveBeenCalledWith(
                expect.stringContaining('insert into produto'),
                expect.arrayContaining(['Amoxicilina', 'Antibiótico'])
            );
        });

        it('deve rejeitar se o banco retornar erro', async () => {
            mockExecutaComandoLastInserted.mockRejectedValue(new Error('Erro de conexão'));

            const produto = new ProdutoModel(
                0, 'Teste', 'Desc', '2027-01-01',
                10, 5, 'Cat', 1, 'Marca', null, null
            );

            await expect(produto.Create()).rejects.toThrow('Erro de conexão');
        });

        it('deve enviar os valores corretos para o SQL', async () => {
            mockExecutaComandoLastInserted.mockResolvedValue(1);

            const produto = new ProdutoModel(
                0, 'Ibuprofeno', 'Anti-inflamatório', '2027-03-15',
                18.90, 150, 'Analgésicos', 2, 'Medley', null, 'ibu.png'
            );

            await produto.Create();

            const chamada = mockExecutaComandoLastInserted.mock.calls[0];
            const valores = chamada[1];

            expect(valores).toEqual([
                'Ibuprofeno', 'Anti-inflamatório', 18.90, 150, 'Analgésicos', 'Medley', 2, 'ibu.png'
            ]);
        });
    });

    describe('ListCategorias()', () => {
        it('deve retornar lista de categorias', async () => {
            const categoriasMock = [
                { idCategoria: 1, cat_nome: 'Medicamentos' },
                { idCategoria: 2, cat_nome: 'Cosméticos' },
                { idCategoria: 3, cat_nome: 'Higiene' }
            ];

            // Mock do discardProductsExpired (retorna vazio = sem vencidos)
            mockExecutaComando
                .mockResolvedValueOnce([]) // discardProductsExpired query
                .mockResolvedValueOnce(categoriasMock); // ListCategorias query

            const produto = new ProdutoModel(
                0, '', '', '', 0, 0, '', 0, '', '', ''
            );
            const result = await produto.ListCategorias();

            expect(result).toEqual(categoriasMock);
            expect(result).toHaveLength(3);
        });

        it('deve executar o descarte de produtos vencidos antes de listar categorias', async () => {
            mockExecutaComando
                .mockResolvedValueOnce([]) // discardProductsExpired — sem vencidos
                .mockResolvedValueOnce([{ idCategoria: 1, cat_nome: 'Teste' }]);

            const produto = new ProdutoModel(
                0, '', '', '', 0, 0, '', 0, '', '', ''
            );
            await produto.ListCategorias();

            // Deve ter chamado ExecutaComando pelo menos 2 vezes
            // (1 para discard + 1 para listar categorias)
            expect(mockExecutaComando).toHaveBeenCalledTimes(2);
        });

        it('deve processar descarte quando existem produtos vencidos', async () => {
            const produtosVencidos = [
                { idProduto: 1, lot_id: 10, lot_qnt: 5 },
                { idProduto: 2, lot_id: 11, lot_qnt: 3 }
            ];

            mockExecutaComando
                .mockResolvedValueOnce(produtosVencidos); // discardProductsExpired — encontrou vencidos
            
            mockExecutaComandoNonQuery
                .mockResolvedValue(true); // inserts no tb_descarte

            // Após o descarte, o ListCategorias chama ExecutaComando novamente
            mockExecutaComando
                .mockResolvedValueOnce([{ idCategoria: 1, cat_nome: 'Geral' }]);

            const produto = new ProdutoModel(
                0, '', '', '', 0, 0, '', 0, '', '', ''
            );
            const result = await produto.ListCategorias();

            // Deve ter inserido registros de descarte
            expect(mockExecutaComandoNonQuery).toHaveBeenCalledTimes(2);
            expect(mockExecutaComandoNonQuery).toHaveBeenCalledWith(
                expect.stringContaining('insert into tb_descarte'),
                expect.arrayContaining([1, 10, 5])
            );
        });

        it('deve retornar lista vazia quando não há categorias', async () => {
            mockExecutaComando
                .mockResolvedValueOnce([]) // discardProductsExpired
                .mockResolvedValueOnce([]); // ListCategorias vazia

            const produto = new ProdutoModel(
                0, '', '', '', 0, 0, '', 0, '', '', ''
            );
            const result = await produto.ListCategorias();

            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });
    });
});
