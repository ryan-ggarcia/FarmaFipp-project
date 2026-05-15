/**
 * Testes unitários para ProdutoModel
 * 
 * Testa os métodos Create(), ListCategorias(), Read(), Get(),
 * Update(), Delete(), DecreaseStock(), toJSON() e a lógica
 * de descarte automático de produtos vencidos.
 */

const { mockExecutaComando, mockExecutaComandoNonQuery, mockExecutaComandoLastInserted } = require('../setup');
const ProdutoModel = require('../../models/ProdutoModel');

// Mock fs para o método Get()
jest.mock('fs', () => ({
    existsSync: jest.fn().mockReturnValue(true)
}));

describe('ProdutoModel', () => {

    describe('constructor', () => {
        it('deve criar uma instância com todos os campos corretamente', () => {
            const produto = new ProdutoModel(
                1, 'Dipirona', 'Analgésico', '2026-12-31',
                15.99, 100, 'Medicamentos', 1, 'Genérico', 'LOTE-001', 'dipirona.png', 10
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
            expect(produto.id_lote).toBe(10);
        });

        it('deve criar instância com id_lote null por padrão', () => {
            const produto = new ProdutoModel(1, 'T', '', '', 0, 0, '', 0, '', '', '');
            expect(produto.id_lote).toBeNull();
        });
    });

    describe('getters e setters', () => {
        it('deve permitir atualizar valores via setters', () => {
            const produto = new ProdutoModel(1, 'Teste', '', '', 0, 0, '', 0, '', '', '');
            produto.nome = 'Novo Nome';
            produto.preco = 29.99;
            produto.quantidade = 50;
            produto.id_lote = 5;

            expect(produto.nome).toBe('Novo Nome');
            expect(produto.preco).toBe(29.99);
            expect(produto.quantidade).toBe(50);
            expect(produto.id_lote).toBe(5);
        });
    });

    describe('toJSON()', () => {
        it('deve retornar objeto com todos os campos', () => {
            const produto = new ProdutoModel(1, 'Dipirona', 'Desc', '2026-12-31', 15, 100, 'Med', 1, 'Gen', 'L1', 'img.png', 10);
            const json = produto.toJSON();
            expect(json).toEqual({
                id: 1, nome: 'Dipirona', descricao: 'Desc', validade: '2026-12-31',
                preco: 15, quantidade: 100, categoria: 'Med', fornecedor: 1,
                marca: 'Gen', lote: 'L1', id_lote: 10, img: 'img.png'
            });
        });
    });

    describe('Create()', () => {
        it('deve inserir um produto e retornar o ID', async () => {
            mockExecutaComandoLastInserted.mockResolvedValue(42);
            const produto = new ProdutoModel(0, 'Amoxicilina', 'Antibiótico', '2027-06-30', 25.50, 200, 'Antibióticos', 3, 'EMS', null, 'amox.png');
            const result = await produto.Create();
            expect(result).toBe(42);
            expect(mockExecutaComandoLastInserted).toHaveBeenCalledWith(
                expect.stringContaining('insert into produto'),
                expect.arrayContaining(['Amoxicilina', 'Antibiótico'])
            );
        });

        it('deve rejeitar se o banco retornar erro', async () => {
            mockExecutaComandoLastInserted.mockRejectedValue(new Error('Erro de conexão'));
            const produto = new ProdutoModel(0, 'Teste', 'Desc', '', 10, 5, 'Cat', 1, 'Marca', null, null);
            await expect(produto.Create()).rejects.toThrow('Erro de conexão');
        });
    });

    describe('ListCategorias()', () => {
        it('deve retornar lista de categorias', async () => {
            const categoriasMock = [{ idCategoria: 1, cat_nome: 'Medicamentos' }, { idCategoria: 2, cat_nome: 'Cosméticos' }];
            mockExecutaComando
                .mockResolvedValueOnce([])  // discardProductsExpired
                .mockResolvedValueOnce(categoriasMock);
            const produto = new ProdutoModel(0, '', '', '', 0, 0, '', 0, '', '', '');
            const result = await produto.ListCategorias();
            expect(result).toEqual(categoriasMock);
        });

        it('deve processar descarte quando existem produtos vencidos', async () => {
            mockExecutaComando.mockResolvedValueOnce([
                { idProduto: 1, lot_id: 10, lot_qnt: 5 },
                { idProduto: 2, lot_id: 11, lot_qnt: 3 }
            ]);
            mockExecutaComandoNonQuery.mockResolvedValue(true);
            mockExecutaComando.mockResolvedValueOnce([{ idCategoria: 1, cat_nome: 'Geral' }]);

            const produto = new ProdutoModel(0, '', '', '', 0, 0, '', 0, '', '', '');
            await produto.ListCategorias();
            expect(mockExecutaComandoNonQuery).toHaveBeenCalledTimes(2);
        });
    });

    describe('Read()', () => {
        it('deve retornar lista de produtos', async () => {
            mockExecutaComando.mockResolvedValue([{
                idProduto: 1, pro_nome: 'Dipirona', descricao: 'Desc', lot_validade: '2026-12-31',
                pro_preco: 15, pro_quantidade: 100, cat_nome: 'Med', forn_nome: 'Forn',
                marca: 'Gen', lot_name: 'L1', pro_img: 'img.png', lot_id: 10
            }]);
            const produto = new ProdutoModel(0, '', '', '', 0, 0, '', 0, '', '', '');
            const lista = await produto.Read();
            expect(lista).toHaveLength(1);
            expect(lista[0].nome).toBe('Dipirona');
        });
    });

    describe('Get()', () => {
        it('deve retornar produto pelo ID', async () => {
            mockExecutaComando.mockResolvedValue([{
                idProduto: 5, pro_nome: 'Ibuprofeno', descricao: 'Anti-inflamatório',
                pro_validade: '2027-01-01', pro_preco: 18.90, pro_quantidade: 50,
                Categoria_Produto: 1, idFornecedor: 2, marca: 'Medley', pro_img: 'ibu.png'
            }]);
            const produto = new ProdutoModel(0, '', '', '', 0, 0, '', 0, '', '', '');
            const result = await produto.Get(5);
            expect(result).not.toBe(false);
            expect(result.nome).toBe('Ibuprofeno');
        });

        it('deve retornar false se não encontrar', async () => {
            mockExecutaComando.mockResolvedValue([]);
            const produto = new ProdutoModel(0, '', '', '', 0, 0, '', 0, '', '', '');
            expect(await produto.Get(999)).toBe(false);
        });
    });

    describe('DecreaseStock()', () => {
        it('deve decrementar estoque com sucesso', async () => {
            mockExecutaComandoNonQuery.mockResolvedValue(true);
            const produto = new ProdutoModel(0, '', '', '', 0, 0, '', 0, '', '', '');
            const result = await produto.DecreaseStock(1, 5);
            expect(result).toBe(true);
            expect(mockExecutaComandoNonQuery).toHaveBeenCalledWith(
                expect.stringContaining('pro_quantidade = pro_quantidade - ?'),
                [5, 1, 5]
            );
        });

        it('deve retornar false para quantidade inválida', async () => {
            const produto = new ProdutoModel(0, '', '', '', 0, 0, '', 0, '', '', '');
            expect(await produto.DecreaseStock(1, 0)).toBe(false);
            expect(await produto.DecreaseStock(1, -5)).toBe(false);
            expect(await produto.DecreaseStock(null, 5)).toBe(false);
        });
    });

    describe('Delete()', () => {
        it('deve marcar produto como inativo', async () => {
            mockExecutaComando.mockResolvedValue({ affectedRows: 1 });
            const produto = new ProdutoModel(0, '', '', '', 0, 0, '', 0, '', '', '');
            await produto.Delete(5);
            expect(mockExecutaComando).toHaveBeenCalledWith(
                expect.stringContaining("prod_status = 'Inativo'"),
                [5]
            );
        });
    });

    describe('Update()', () => {
        it('deve atualizar produto com imagem', async () => {
            mockExecutaComando.mockResolvedValue({ affectedRows: 1 });
            const produto = new ProdutoModel(5, 'Nome', 'Desc', '', 10, 50, 'Cat', 1, 'Marca', '', 'img.png');
            await produto.Update();
            const sql = mockExecutaComando.mock.calls[0][0];
            expect(sql).toContain('pro_img = ?');
        });

        it('deve atualizar produto sem imagem', async () => {
            mockExecutaComando.mockResolvedValue({ affectedRows: 1 });
            const produto = new ProdutoModel(5, 'Nome', 'Desc', '', 10, 50, 'Cat', 1, 'Marca', '', null);
            await produto.Update();
            const sql = mockExecutaComando.mock.calls[0][0];
            expect(sql).not.toContain('pro_img = ?');
        });
    });
});
