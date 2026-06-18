const {
    mockExecutaComando,
    mockExecutaComandoNonQuery,
    mockExecutaComandoLastInserted
} = require('../setup');
const ClienteModel = require('../../models/ClienteModel');

const CLIENTE_ROW = {
    idClinete: 1,
    cli_nome: 'Maria Santos',
    cli_status: 1,
    cli_cpf: '52998224725',
    cli_email: 'maria@test.com',
    cli_senha: '$2b$10$hash',
    cli_telefone: '11999997777',
    cli_nascimento: '1985-03-20',
    perfil_id: 1,
    end_id: 10,
    end_rua: 'Rua A',
    end_bairro: 'Bairro B',
    end_cidade: 'Cidade C',
    end_num: '200',
    end_estado: 'SP',
    end_uf: 'SP',
    end_cep: '01001-000',
    end_complemento: ''
};

describe('ClienteModel', () => {

    describe('Create()', () => {
        it('insere cliente e retorna o ID gerado', async () => {
            mockExecutaComandoLastInserted.mockResolvedValueOnce(15);
            const c = new ClienteModel(0, 'João', 1, '52998224725', 'joao@test.com', '$2b$10$hash', '11999', '1990-01-01', 1);
            const result = await c.Create();
            expect(result).toBe(15);
        });

        it('usa query INSERT parametrizada — dados não concatenados na SQL', async () => {
            mockExecutaComandoLastInserted.mockResolvedValueOnce(16);
            const c = new ClienteModel(0, 'Ana', 1, '52998224725', 'ana@test.com', '$2b$10$hash', '11999', '1990-01-01', 1);
            await c.Create();
            const [sql, values] = mockExecutaComandoLastInserted.mock.calls[0];
            expect(sql).toContain('insert into cliente');
            expect(sql).toContain('?');
            expect(values).toContain('ana@test.com');
            expect(sql).not.toContain('ana@test.com');
        });

        it('propaga exceção quando o banco falha', async () => {
            mockExecutaComandoLastInserted.mockRejectedValueOnce(new Error('FK violation'));
            const c = new ClienteModel(0, 'Err', 1, '52998224725', 'err@test.com', 'hash', '11', '1990-01-01', 1);
            await expect(c.Create()).rejects.toThrow('FK violation');
        });
    });

    describe('Get(id)', () => {
        it('retorna ClienteModel populado quando ID existe', async () => {
            mockExecutaComando.mockResolvedValueOnce([CLIENTE_ROW]);
            const c = new ClienteModel();
            const result = await c.Get(1);
            expect(result).not.toBeNull();
            expect(result.cliId).toBe(1);
            expect(result.cliNome).toBe('Maria Santos');
            expect(result.cliEmail).toBe('maria@test.com');
            expect(result.perfilId).toBe(1);
            expect(result.cliStatus).toBe(1);
        });

        it('popula campos de endereço no retorno do Get()', async () => {
            mockExecutaComando.mockResolvedValueOnce([CLIENTE_ROW]);
            const c = new ClienteModel();
            const result = await c.Get(1);
            expect(result.endRua).toBe('Rua A');
            expect(result.endCidade).toBe('Cidade C');
            expect(result.endCep).toBe('01001-000');
        });

        it('retorna null quando ID não existe no banco', async () => {
            mockExecutaComando.mockResolvedValueOnce([]);
            const c = new ClienteModel();
            const result = await c.Get(9999);
            expect(result).toBeNull();
        });

        it('usa query parametrizada — ID não é concatenado na SQL', async () => {
            mockExecutaComando.mockResolvedValueOnce([CLIENTE_ROW]);
            const c = new ClienteModel();
            await c.Get(1);
            const [sql, values] = mockExecutaComando.mock.calls[0];
            expect(sql).toContain('?');
            expect(values).toContain(1);
            expect(sql).not.toMatch(/idClinete\s*=\s*1/);
        });
    });

    describe('FindByCpf(cpf)', () => {
        it('retorna cliente quando CPF existe no banco', async () => {
            mockExecutaComando.mockResolvedValueOnce([CLIENTE_ROW]);
            const c = new ClienteModel();
            const result = await c.FindByCpf('52998224725');
            expect(result).not.toBeNull();
            expect(result.cliCpf).toBe('52998224725');
        });

        it('retorna null quando CPF não existe', async () => {
            mockExecutaComando.mockResolvedValueOnce([]);
            const c = new ClienteModel();
            const result = await c.FindByCpf('00000000000');
            expect(result).toBeNull();
        });

        it('usa query parametrizada para busca por CPF', async () => {
            const cpfMalicioso = "' OR 1=1; --";
            mockExecutaComando.mockResolvedValueOnce([]);
            const c = new ClienteModel();
            await c.FindByCpf(cpfMalicioso);
            const [sql, values] = mockExecutaComando.mock.calls[0];
            expect(sql).toContain('?');
            expect(values[0]).toBe(cpfMalicioso);
            expect(sql).not.toContain(cpfMalicioso);
        });
    });

    describe('FindByEmail(email)', () => {
        it('retorna cliente quando email existe no banco', async () => {
            mockExecutaComando.mockResolvedValueOnce([CLIENTE_ROW]);
            const c = new ClienteModel();
            const result = await c.FindByEmail('maria@test.com');
            expect(result).not.toBeNull();
            expect(result.cliEmail).toBe('maria@test.com');
        });

        it('retorna null quando email não existe', async () => {
            mockExecutaComando.mockResolvedValueOnce([]);
            const c = new ClienteModel();
            const result = await c.FindByEmail('naoexiste@test.com');
            expect(result).toBeNull();
        });

        it('usa query parametrizada para busca por email', async () => {
            const emailMalicioso = "admin'--";
            mockExecutaComando.mockResolvedValueOnce([]);
            const c = new ClienteModel();
            await c.FindByEmail(emailMalicioso);
            const [sql, values] = mockExecutaComando.mock.calls[0];
            expect(sql).toContain('?');
            expect(values[0]).toBe(emailMalicioso);
            expect(sql).not.toContain(emailMalicioso);
        });
    });

    describe('Read()', () => {
        it('retorna lista de clientes com campos corretos', async () => {
            mockExecutaComando.mockResolvedValueOnce([
                CLIENTE_ROW,
                { ...CLIENTE_ROW, idClinete: 2, cli_email: 'outro@test.com', cli_cpf: '11111111111' }
            ]);
            const c = new ClienteModel();
            const lista = await c.Read();
            expect(lista).toHaveLength(2);
            expect(lista[0].cliId).toBe(1);
            expect(lista[1].cliEmail).toBe('outro@test.com');
        });

        it('retorna lista vazia quando não há clientes', async () => {
            mockExecutaComando.mockResolvedValueOnce([]);
            const c = new ClienteModel();
            const lista = await c.Read();
            expect(lista).toHaveLength(0);
            expect(Array.isArray(lista)).toBe(true);
        });
    });

    describe('Update()', () => {
        it('retorna true quando atualização tem sucesso', async () => {
            mockExecutaComandoNonQuery.mockResolvedValueOnce(true);
            const c = new ClienteModel(1, 'Maria Nova', 1, '52998224725', 'maria@test.com', '$2b$10$hash', '11', '1985-03-20', 1);
            const result = await c.Update();
            expect(result).toBe(true);
        });

        it('retorna false quando nenhuma linha é afetada', async () => {
            mockExecutaComandoNonQuery.mockResolvedValueOnce(false);
            const c = new ClienteModel(999, 'X', 1, '52998224725', 'x@x.com', 'hash', '11', '1990-01-01', 1);
            const result = await c.Update();
            expect(result).toBe(false);
        });

        it('usa query UPDATE parametrizada com ID', async () => {
            mockExecutaComandoNonQuery.mockResolvedValueOnce(true);
            const c = new ClienteModel(5, 'João', 1, '52998224725', 'joao@test.com', '$2b$10$hash', '11', '1990-01-01', 1);
            await c.Update();
            const [sql, values] = mockExecutaComandoNonQuery.mock.calls[0];
            expect(sql).toContain('update cliente');
            expect(sql).toContain('?');
            expect(values).toContain(5);
        });
    });

    describe('Delete(id)', () => {
        it('retorna true ao deletar cliente existente', async () => {
            mockExecutaComandoNonQuery.mockResolvedValueOnce(true);
            const c = new ClienteModel();
            const result = await c.Delete(1);
            expect(result).toBe(true);
        });

        it('usa query DELETE parametrizada — ID não concatenado', async () => {
            mockExecutaComandoNonQuery.mockResolvedValueOnce(true);
            const c = new ClienteModel();
            await c.Delete(5);
            const [sql, values] = mockExecutaComandoNonQuery.mock.calls[0];
            expect(sql).toContain('delete from cliente');
            expect(sql).toContain('?');
            expect(values).toContain(5);
            expect(sql).not.toMatch(/idClinete\s*=\s*5/);
        });

        it('payload de ID malicioso não é concatenado na query DELETE', async () => {
            const idMalicioso = "1 OR 1=1";
            mockExecutaComandoNonQuery.mockResolvedValueOnce(true);
            const c = new ClienteModel();
            await c.Delete(idMalicioso);
            const [sql, values] = mockExecutaComandoNonQuery.mock.calls[0];
            expect(sql).not.toContain('OR 1=1');
            expect(values[0]).toBe(idMalicioso);
        });
    });
});
