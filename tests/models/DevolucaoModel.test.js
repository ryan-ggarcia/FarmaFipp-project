const { mockExecutaComando, mockExecutaComandoNonQuery, mockExecutaComandoLastInserted } = require('../setup');
const DevolucaoModel = require('../../models/DevolucaoModel');

describe('DevolucaoModel', () => {
    describe('constructor e getters/setters', () => {
        it('deve criar instância com todos os campos', () => {
            const d = new DevolucaoModel(1,'2026-05-15','Aguardando','Defeito',50,'Venda','presencial','2026-05-01',null,10,5,'João','Maria');
            expect(d.getID()).toBe(1);
            expect(d.getSTATUS()).toBe('Aguardando');
            expect(d.getTIPO()).toBe('Venda');
            expect(d.getORIGEM()).toBe('presencial');
            expect(d.getNOMECLIENTE()).toBe('João');
        });

        it('deve atualizar via setters', () => {
            const d = new DevolucaoModel(0,null,null,null,0,null,null,null,null,null,null,null,null);
            d.setID(99); d.setSTATUS('Aprovado'); d.setOBSERVACAO('OK'); d.setFUNCIONARIOID(3);
            expect(d.getID()).toBe(99);
            expect(d.getSTATUS()).toBe('Aprovado');
        });
    });

    describe('cadastrar()', () => {
        it('deve inserir e retornar o ID', async () => {
            mockExecutaComandoLastInserted.mockResolvedValue(15);
            const d = new DevolucaoModel(0,'2026-05-15','Aprovado','Troca',0,'Venda','presencial','2026-05-10',null,10,5,null,null);
            const result = await d.cadastrar();
            expect(result).toBe(15);
            expect(mockExecutaComandoLastInserted).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO efetuar_devolucao'), expect.any(Array));
        });

        it('deve rejeitar em erro', async () => {
            mockExecutaComandoLastInserted.mockRejectedValue(new Error('FK constraint'));
            const d = new DevolucaoModel(0,'2026-05-15','Aguardando','',0,'Venda','presencial','2026-05-10',null,null,null,null,null);
            await expect(d.cadastrar()).rejects.toThrow('FK constraint');
        });
    });

    describe('listar()', () => {
        it('deve retornar lista de devoluções', async () => {
            mockExecutaComando.mockResolvedValue([
                { idEfetuar_devolucao:1, devo_data:'2026-05-15', devo_status:'Aprovado', devo_observacao:'OK', devo_valorTotal:50, devo_tipo:'Venda', devo_origem:'presencial', devo_data_compra:'2026-05-01', devo_data_finalizacao:'2026-05-15', Cliente_Devolucao:10, Funcionario_idFuncionario:5, cli_nome:'João', func_nome:'Maria' }
            ]);
            const d = new DevolucaoModel();
            const lista = await d.listar();
            expect(lista).toHaveLength(1);
            expect(lista[0].getSTATUS()).toBe('Aprovado');
        });

        it('deve retornar vazio', async () => {
            mockExecutaComando.mockResolvedValue([]);
            const d = new DevolucaoModel();
            expect(await d.listar()).toEqual([]);
        });
    });

    describe('obter()', () => {
        it('deve retornar devolução pelo ID', async () => {
            mockExecutaComando.mockResolvedValue([{ idEfetuar_devolucao:5, devo_data:'2026-05-10', devo_status:'Aguardando', devo_observacao:'', devo_valorTotal:75, devo_tipo:'Venda', devo_origem:'online', devo_data_compra:'2026-04-28', devo_data_finalizacao:null, Cliente_Devolucao:8, Funcionario_idFuncionario:null, cli_nome:'Ana', func_nome:null }]);
            const d = new DevolucaoModel();
            const r = await d.obter(5);
            expect(r).not.toBeNull();
            expect(r.getID()).toBe(5);
        });

        it('deve retornar null se não encontrar', async () => {
            mockExecutaComando.mockResolvedValue([]);
            const d = new DevolucaoModel();
            expect(await d.obter(999)).toBeNull();
        });
    });

    describe('atualizarStatus()', () => {
        it('deve atualizar com finalização', async () => {
            mockExecutaComandoNonQuery.mockResolvedValue(true);
            const d = new DevolucaoModel();
            d.setID(5); d.setSTATUS('Aprovado'); d.setOBSERVACAO('OK'); d.setFUNCIONARIOID(3); d.setDATAFINALIZACAO(new Date());
            expect(await d.atualizarStatus()).toBe(true);
            expect(mockExecutaComandoNonQuery.mock.calls[0][0]).toContain('devo_data_finalizacao');
        });

        it('deve atualizar sem finalização', async () => {
            mockExecutaComandoNonQuery.mockResolvedValue(true);
            const d = new DevolucaoModel();
            d.setID(5); d.setSTATUS('Nao Aprovado'); d.setOBSERVACAO('Recusado'); d.setFUNCIONARIOID(3);
            await d.atualizarStatus();
            expect(mockExecutaComandoNonQuery.mock.calls[0][0]).not.toContain('devo_data_finalizacao');
        });
    });

    describe('deletar()', () => {
        it('deve deletar itens e devolução', async () => {
            mockExecutaComandoNonQuery.mockResolvedValueOnce(true).mockResolvedValueOnce(true);
            const d = new DevolucaoModel();
            expect(await d.deletar(5)).toBe(true);
            expect(mockExecutaComandoNonQuery).toHaveBeenCalledTimes(2);
            expect(mockExecutaComandoNonQuery.mock.calls[0][0]).toContain('DELETE FROM item_devolucao');
            expect(mockExecutaComandoNonQuery.mock.calls[1][0]).toContain('DELETE FROM efetuar_devolucao');
        });
    });
});
