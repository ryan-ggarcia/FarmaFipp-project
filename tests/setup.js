/**
 * Setup compartilhado para testes — Mock do Database
 * 
 * Este módulo fornece mocks do Database para que os testes 
 * não dependam de uma conexão real com o banco de dados.
 */

const mockExecutaComando = jest.fn();
const mockExecutaComandoNonQuery = jest.fn();
const mockExecutaComandoLastInserted = jest.fn();

// Mock do módulo Database
jest.mock('../utils/database', () => {
    return jest.fn().mockImplementation(() => ({
        ExecutaComando: mockExecutaComando,
        ExecutaComandoNonQuery: mockExecutaComandoNonQuery,
        ExecutaComandoLastInserted: mockExecutaComandoLastInserted
    }));
});

// Limpar mocks entre cada teste
beforeEach(() => {
    mockExecutaComando.mockReset();
    mockExecutaComandoNonQuery.mockReset();
    mockExecutaComandoLastInserted.mockReset();
});

module.exports = {
    mockExecutaComando,
    mockExecutaComandoNonQuery,
    mockExecutaComandoLastInserted
};
