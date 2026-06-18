const { mockExecutaComando, mockExecutaComandoNonQuery } = require('../setup');
const ItemDevolucaoModel = require('../../models/ItemDevolucaoModel');

describe('ItemDevolucaoModel', () => {
    describe('constructor e getters/setters', () => {
        it('deve criar instância corretamente', () => {
            const item = new ItemDevolucaoModel(1, 3, 10, 'Produto com defeito', 42, 'Dipirona');
            expect(item.getID()).toBe(1);
            expect(item.getQUANTIDADE()).toBe(3);
            expect(item.getDEVOLUCAOID()).toBe(10);
            expect(item.getMOTIVO()).toBe('Produto com defeito');
            expect(item.getPRODUTOID()).toBe(42);
            expect(item.getNOMEPRODUTO()).toBe('Dipirona');
        });

        it('deve atualizar via setters', () => {
            const item = new ItemDevolucaoModel(0, 0, 0, '', 0, '');
            item.setQUANTIDADE(5);
            item.setMOTIVO('Validade expirada');
            expect(item.getQUANTIDADE()).toBe(5);
            expect(item.getMOTIVO()).toBe('Validade expirada');
        });
    });

    describe('cadastrar()', () => {
        it('deve inserir item de devolução', async () => {
            mockExecutaComandoNonQuery.mockResolvedValue(true);
            const item = new ItemDevolucaoModel(0, 2, 15, 'Defeito de fábrica', 7, null);
            const result = await item.cadastrar();
            expect(result).toBe(true);
            expect(mockExecutaComandoNonQuery).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO item_devolucao'),
                [2, 15, 'Defeito de fábrica', 7, null]
            );
        });

        it('deve rejeitar em erro de banco', async () => {
            mockExecutaComandoNonQuery.mockRejectedValue(new Error('Erro SQL'));
            const item = new ItemDevolucaoModel(0, 1, 1, 'Motivo', 1, null);
            await expect(item.cadastrar()).rejects.toThrow('Erro SQL');
        });
    });

    describe('listarPorDevolucao()', () => {
        it('deve retornar itens da devolução', async () => {
            mockExecutaComando.mockResolvedValue([
                { idItem_devolucao: 1, itemDev_quantidade: 2, EfetuarDevolucao_ItemDevolucao: 10, itemDev_motivo: 'Defeito', Produto_ItemDevolucao: 5, pro_nome: 'Dipirona' },
                { idItem_devolucao: 2, itemDev_quantidade: 1, EfetuarDevolucao_ItemDevolucao: 10, itemDev_motivo: 'Vencido', Produto_ItemDevolucao: 8, pro_nome: 'Amoxicilina' }
            ]);
            const item = new ItemDevolucaoModel();
            const lista = await item.listarPorDevolucao(10);
            expect(lista).toHaveLength(2);
            expect(lista[0].getNOMEPRODUTO()).toBe('Dipirona');
            expect(lista[1].getMOTIVO()).toBe('Vencido');
        });

        it('deve retornar lista vazia', async () => {
            mockExecutaComando.mockResolvedValue([]);
            const item = new ItemDevolucaoModel();
            expect(await item.listarPorDevolucao(999)).toEqual([]);
        });

        it('deve filtrar por ID da devolução', async () => {
            mockExecutaComando.mockResolvedValue([]);
            const item = new ItemDevolucaoModel();
            await item.listarPorDevolucao(42);
            expect(mockExecutaComando).toHaveBeenCalledWith(
                expect.stringContaining('WHERE i.EfetuarDevolucao_ItemDevolucao = ?'),
                [42]
            );
        });
    });
});
