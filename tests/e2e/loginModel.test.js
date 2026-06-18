const { mockExecutaComando } = require('../setup');
const LoginModel = require('../../models/LoginModel');

describe('LoginModel', () => {

    describe('verificar(email)', () => {
        it('retorna null quando email não existe no banco', async () => {
            mockExecutaComando.mockResolvedValueOnce([]);
            const model = new LoginModel();
            const result = await model.verificar('naoexiste@test.com');
            expect(result).toBeNull();
        });

        it('retorna LoginModel populado quando email existe', async () => {
            mockExecutaComando.mockResolvedValueOnce([{
                idClinete: 42,
                cli_email: 'user@test.com',
                cli_senha: '$2b$10$hashedpassword',
                perfil_id: 1
            }]);
            const model = new LoginModel();
            const result = await model.verificar('user@test.com');
            expect(result).not.toBeNull();
            expect(result.cli_id).toBe(42);
            expect(result.email).toBe('user@test.com');
            expect(result.senha).toBe('$2b$10$hashedpassword');
        });

        it('mapeia perfil_id para o campo cli_status do objeto retornado', async () => {
            mockExecutaComando.mockResolvedValueOnce([{
                idClinete: 5,
                cli_email: 'admin@test.com',
                cli_senha: 'hash',
                perfil_id: 3
            }]);
            const model = new LoginModel();
            const result = await model.verificar('admin@test.com');
            expect(result.cli_status).toBe(3);
        });

        it('mapeia idClinete para cli_id mesmo com typo no campo do banco', async () => {
            mockExecutaComando.mockResolvedValueOnce([{
                idClinete: 99,
                cli_email: 'x@x.com',
                cli_senha: 'hash',
                perfil_id: 1
            }]);
            const model = new LoginModel();
            const result = await model.verificar('x@x.com');
            expect(result.cli_id).toBe(99);
        });

        it('usa query parametrizada — email malicioso não é concatenado na SQL', async () => {
            const payload = "' OR '1'='1'; --";
            mockExecutaComando.mockResolvedValueOnce([]);
            const model = new LoginModel();
            await model.verificar(payload);
            const [sql, valores] = mockExecutaComando.mock.calls[0];
            expect(sql).toContain('?');
            expect(valores).toContain(payload);
            expect(sql).not.toContain(payload);
        });

        it('query não contém DROP TABLE mesmo com payload malicioso', async () => {
            const payload = "'; DROP TABLE cliente; --";
            mockExecutaComando.mockResolvedValueOnce([]);
            const model = new LoginModel();
            await model.verificar(payload);
            const [sql] = mockExecutaComando.mock.calls[0];
            expect(sql).not.toContain('DROP');
        });

        it('propaga exceção quando o banco falha', async () => {
            mockExecutaComando.mockRejectedValueOnce(new Error('DB connection error'));
            const model = new LoginModel();
            await expect(model.verificar('test@test.com')).rejects.toThrow('DB connection error');
        });
    });
});
