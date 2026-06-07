/**
 * Setup compartilhado para testes — Mock do Database
 * 
 * Este módulo fornece mocks do Database para que os testes 
 * não dependam de uma conexão real com o banco de dados.
 */

const mockExecutaComando = jest.fn();
const mockExecutaComandoNonQuery = jest.fn();
const mockExecutaComandoLastInserted = jest.fn();
const mockBeginTransaction = jest.fn();
const mockCommit = jest.fn();
const mockRollback = jest.fn();
const mockExecutaComandoTransacao = jest.fn();
const mockExecutaComandoNonQueryTransacao = jest.fn();
const mockExecutaComandoLastInsertedTransacao = jest.fn();

// Mock do módulo Database
jest.mock('../utils/database', () => {
    return jest.fn().mockImplementation(() => ({
        ExecutaComando: mockExecutaComando,
        ExecutaComandoNonQuery: mockExecutaComandoNonQuery,
        ExecutaComandoLastInserted: mockExecutaComandoLastInserted,
        BeginTransaction: mockBeginTransaction,
        Commit: mockCommit,
        Rollback: mockRollback,
        ExecutaComandoTransacao: mockExecutaComandoTransacao,
        ExecutaComandoNonQueryTransacao: mockExecutaComandoNonQueryTransacao,
        ExecutaComandoLastInsertedTransacao: mockExecutaComandoLastInsertedTransacao
    }));
});

// Limpar mocks entre cada teste
beforeEach(() => {
    mockExecutaComando.mockReset();
    mockExecutaComandoNonQuery.mockReset();
    mockExecutaComandoLastInserted.mockReset();
    mockBeginTransaction.mockReset();
    mockCommit.mockReset();
    mockRollback.mockReset();
    mockExecutaComandoTransacao.mockReset();
    mockExecutaComandoNonQueryTransacao.mockReset();
    mockExecutaComandoLastInsertedTransacao.mockReset();
});

module.exports = {
    mockExecutaComando,
    mockExecutaComandoNonQuery,
    mockExecutaComandoLastInserted,
    mockBeginTransaction,
    mockCommit,
    mockRollback,
    mockExecutaComandoTransacao,
    mockExecutaComandoNonQueryTransacao,
    mockExecutaComandoLastInsertedTransacao
};
