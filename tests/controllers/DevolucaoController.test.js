/**
 * Testes unitários para DevolucaoController
 */

// Mocks dos models
jest.mock('../../models/DevolucaoModel');
jest.mock('../../models/ItemDevolucaoModel');
jest.mock('../../models/ProdutoModel');
jest.mock('../../models/ClienteModel');
jest.mock('../../models/LoteModel');
jest.mock('../../models/EstoqueModel');
jest.mock('../../models/ItemVendaModel');

const DevolucaoController = require('../../controllers/DevolucaoController');
const DevolucaoModel = require('../../models/DevolucaoModel');
const ItemDevolucaoModel = require('../../models/ItemDevolucaoModel');
const EstoqueModel = require('../../models/EstoqueModel');
const ItemVendaModel = require('../../models/ItemVendaModel');
const LoteModel = require('../../models/LoteModel');

describe('DevolucaoController', () => {
    let controller;
    let mockReq;
    let mockRes;

    beforeEach(() => {
        controller = new DevolucaoController();
        mockReq = { body: {}, params: {} };
        mockRes = {
            render: jest.fn(),
            send: jest.fn(),
            redirect: jest.fn(),
            status: jest.fn().mockReturnThis()
        };
        jest.clearAllMocks();

        // Restock é exercitado em teste de integração; aqui o guard de idempotência
        // curto-circuita o fluxo para manter os testes unitários do controller isolados.
        EstoqueModel.mockImplementation(() => ({
            existeMovimentacaoPorOrigem: jest.fn().mockResolvedValue(true)
        }));

        // Substituto de troca (RN-11): por padrão há lote disponível.
        LoteModel.mockImplementation(() => ({
            getLoteParaVenda: jest.fn().mockResolvedValue(1)
        }));
    });

    describe('cadastrarPresencial()', () => {
        it('deve rejeitar se campos obrigatórios faltam', async () => {
            mockReq.body = { tipo: 'Venda' }; // faltam campos
            await controller.cadastrarPresencial(mockReq, mockRes);
            expect(mockRes.send).toHaveBeenCalledWith(expect.objectContaining({ ok: false }));
        });

        it('deve rejeitar se prazo de 30 dias expirado', async () => {
            const dataAntiga = new Date();
            dataAntiga.setDate(dataAntiga.getDate() - 60);
            mockReq.body = {
                tipo: 'Venda', clienteId: 1, dataCompra: dataAntiga.toISOString().split('T')[0],
                produtoId: 1, quantidade: 1, motivo: 'Defeito'
            };
            await controller.cadastrarPresencial(mockReq, mockRes);
            expect(mockRes.send).toHaveBeenCalledWith(expect.objectContaining({
                ok: false, msg: expect.stringContaining('expirado')
            }));
        });

        it('deve rejeitar data de compra futura', async () => {
            const dataFutura = new Date();
            dataFutura.setDate(dataFutura.getDate() + 10);
            mockReq.body = {
                tipo: 'Venda', clienteId: 1, dataCompra: dataFutura.toISOString().split('T')[0],
                produtoId: 1, quantidade: 1, motivo: 'Defeito'
            };
            await controller.cadastrarPresencial(mockReq, mockRes);
            expect(mockRes.send).toHaveBeenCalledWith(expect.objectContaining({
                ok: false, msg: expect.stringContaining('futura')
            }));
        });

        it('deve cadastrar com sucesso', async () => {
            const dataRecente = new Date();
            dataRecente.setDate(dataRecente.getDate() - 5);
            mockReq.body = {
                tipo: 'Venda', clienteId: 1, dataCompra: dataRecente.toISOString().split('T')[0],
                produtoId: 1, quantidade: 2, motivo: 'Defeito', observacao: 'OK', produtoSubstituto: 2
            };

            const mockCadastrar = jest.fn().mockResolvedValue(10);
            DevolucaoModel.mockImplementation(() => ({ cadastrar: mockCadastrar }));

            const mockItemCadastrar = jest.fn().mockResolvedValue(true);
            ItemDevolucaoModel.mockImplementation(() => ({
                cadastrar: mockItemCadastrar,
                totalDevolvidoAprovadoPorProduto: jest.fn().mockResolvedValue(0)
            }));

            // Produto com histórico de venda suficiente (RN-13)
            ItemVendaModel.mockImplementation(() => ({
                totalVendidoPorProduto: jest.fn().mockResolvedValue(100)
            }));

            await controller.cadastrarPresencial(mockReq, mockRes);
            expect(mockRes.send).toHaveBeenCalledWith(expect.objectContaining({ ok: true }));
        });
    });

    describe('atualizarStatus()', () => {
        it('deve rejeitar sem ID ou status', async () => {
            mockReq.body = {};
            await controller.atualizarStatus(mockReq, mockRes);
            expect(mockRes.send).toHaveBeenCalledWith(expect.objectContaining({ ok: false }));
        });

        it('deve rejeitar status inválido', async () => {
            mockReq.body = { id: 1, status: 'StatusInvalido' };
            await controller.atualizarStatus(mockReq, mockRes);
            expect(mockRes.send).toHaveBeenCalledWith(expect.objectContaining({
                ok: false, msg: expect.stringContaining('inválido')
            }));
        });

        it('deve aceitar status Aprovado', async () => {
            mockReq.body = { id: 1, status: 'Aprovado', observacao: 'OK' };
            const mockAtualizar = jest.fn().mockResolvedValue(true);
            DevolucaoModel.mockImplementation(() => ({
                setID: jest.fn(), setSTATUS: jest.fn(), setOBSERVACAO: jest.fn(),
                setFUNCIONARIOID: jest.fn(), setDATAFINALIZACAO: jest.fn(),
                atualizarStatus: mockAtualizar
            }));
            await controller.atualizarStatus(mockReq, mockRes);
            expect(mockRes.send).toHaveBeenCalledWith(expect.objectContaining({ ok: true }));
        });
    });

    describe('deletar()', () => {
        it('deve rejeitar sem ID', async () => {
            mockReq.body = {};
            await controller.deletar(mockReq, mockRes);
            expect(mockRes.send).toHaveBeenCalledWith(expect.objectContaining({ ok: false }));
        });

        it('deve rejeitar ID = 0', async () => {
            mockReq.body = { id: '0' };
            await controller.deletar(mockReq, mockRes);
            expect(mockRes.send).toHaveBeenCalledWith(expect.objectContaining({ ok: false }));
        });

        it('deve deletar com sucesso', async () => {
            mockReq.body = { id: '5' };
            const mockDeletar = jest.fn().mockResolvedValue(true);
            DevolucaoModel.mockImplementation(() => ({ deletar: mockDeletar }));
            await controller.deletar(mockReq, mockRes);
            expect(mockRes.send).toHaveBeenCalledWith(expect.objectContaining({ ok: true }));
        });
    });

    describe('solicitarOnline()', () => {
        it('deve rejeitar sem campos obrigatórios', async () => {
            mockReq.body = { tipo: 'Venda' };
            await controller.solicitarOnline(mockReq, mockRes);
            expect(mockRes.send).toHaveBeenCalledWith(expect.objectContaining({ ok: false }));
        });

        it('deve cadastrar solicitação online com sucesso', async () => {
            const dataRecente = new Date();
            dataRecente.setDate(dataRecente.getDate() - 3);
            mockReq.body = {
                tipo: 'Venda', produtoId: 1, dataCompra: dataRecente.toISOString().split('T')[0],
                quantidade: 1, motivo: 'Defeito', nomeCliente: 'João', contato: '(18)99999-0000', produtoSubstituto: 2
            };
            DevolucaoModel.mockImplementation(() => ({ cadastrar: jest.fn().mockResolvedValue(20) }));
            ItemDevolucaoModel.mockImplementation(() => ({
                cadastrar: jest.fn().mockResolvedValue(true),
                totalDevolvidoAprovadoPorProduto: jest.fn().mockResolvedValue(0)
            }));
            ItemVendaModel.mockImplementation(() => ({
                totalVendidoPorProduto: jest.fn().mockResolvedValue(100)
            }));
            await controller.solicitarOnline(mockReq, mockRes);
            expect(mockRes.send).toHaveBeenCalledWith(expect.objectContaining({ ok: true }));
        });
    });
});
