const { mockExecutaComando } = require('../setup');
const authMiddleware = require('../../middleware/authMiddleware');

function mockReqRes(cookies = {}) {
    const res = {
        _redirected: null,
        locals: {},
        redirect(url) { this._redirected = url; }
    };
    const req = { signedCookies: cookies };
    const next = jest.fn();
    return { req, res, next };
}

const ROW_ADMIN = {
    idClinete: 10,
    cli_nome: 'Admin User',
    cli_status: 1,
    cli_cpf: '52998224725',
    cli_email: 'admin@test.com',
    cli_senha: '$2b$10$hash',
    cli_telefone: '11',
    cli_nascimento: '1990-01-01',
    perfil_id: 3,
    end_id: null, end_rua: null, end_bairro: null, end_cidade: null,
    end_num: null, end_estado: null, end_uf: null, end_cep: null, end_complemento: null
};

const ROW_CLIENTE = { ...ROW_ADMIN, idClinete: 5, cli_nome: 'Cliente Normal', cli_email: 'cliente@test.com', perfil_id: 1 };
const ROW_INATIVO = { ...ROW_ADMIN, cli_status: 0 };
const ROW_PERFIL2 = { ...ROW_ADMIN, perfil_id: 2, cli_nome: 'Parceiro' };

describe('AuthMiddleware', () => {

    // ─── validarCliente ──────────────────────────────────────────────────────
    describe('validarCliente', () => {
        it('redireciona para /login/ quando signedCookies está vazio', async () => {
            const { req, res, next } = mockReqRes({});
            await authMiddleware.validarCliente(req, res, next);
            expect(res._redirected).toBe('/login/');
            expect(next).not.toHaveBeenCalled();
        });

        it('redireciona quando signedCookies é undefined', async () => {
            const req = { signedCookies: undefined };
            const res = { _redirected: null, locals: {}, redirect(url) { this._redirected = url; } };
            const next = jest.fn();
            await authMiddleware.validarCliente(req, res, next);
            expect(res._redirected).toBe('/login/');
        });

        it('redireciona quando usuário não existe no banco (Get retorna null)', async () => {
            mockExecutaComando.mockResolvedValueOnce([]);
            const { req, res, next } = mockReqRes({ usuarioLogado: '99' });
            await authMiddleware.validarCliente(req, res, next);
            expect(res._redirected).toBe('/login/');
            expect(next).not.toHaveBeenCalled();
        });

        it('redireciona quando cliStatus é 0 (usuário inativo)', async () => {
            mockExecutaComando.mockResolvedValueOnce([ROW_INATIVO]);
            const { req, res, next } = mockReqRes({ usuarioLogado: '10' });
            await authMiddleware.validarCliente(req, res, next);
            expect(res._redirected).toBe('/login/');
            expect(next).not.toHaveBeenCalled();
        });

        it('redireciona quando perfilId é 2 (não é 1 nem 3)', async () => {
            mockExecutaComando.mockResolvedValueOnce([ROW_PERFIL2]);
            const { req, res, next } = mockReqRes({ usuarioLogado: '10' });
            await authMiddleware.validarCliente(req, res, next);
            expect(res._redirected).toBe('/login/');
            expect(next).not.toHaveBeenCalled();
        });

        it('chama next() para usuário ativo com perfilId 1 (cliente comum)', async () => {
            mockExecutaComando.mockResolvedValueOnce([ROW_CLIENTE]);
            const { req, res, next } = mockReqRes({ usuarioLogado: '5' });
            await authMiddleware.validarCliente(req, res, next);
            expect(next).toHaveBeenCalledTimes(1);
            expect(res._redirected).toBeNull();
        });

        it('chama next() para usuário ativo com perfilId 3 (admin)', async () => {
            mockExecutaComando.mockResolvedValueOnce([ROW_ADMIN]);
            const { req, res, next } = mockReqRes({ usuarioLogado: '10' });
            await authMiddleware.validarCliente(req, res, next);
            expect(next).toHaveBeenCalledTimes(1);
            expect(res._redirected).toBeNull();
        });
    });

    // ─── validarAdmin ─────────────────────────────────────────────────────────
    describe('validarAdmin', () => {
        it('redireciona para /login/ quando signedCookies está vazio', async () => {
            const { req, res, next } = mockReqRes({});
            await authMiddleware.validarAdmin(req, res, next);
            expect(res._redirected).toBe('/login/');
            expect(next).not.toHaveBeenCalled();
        });

        it('redireciona quando usuário não existe no banco', async () => {
            mockExecutaComando.mockResolvedValueOnce([]);
            const { req, res, next } = mockReqRes({ usuarioLogado: '999' });
            await authMiddleware.validarAdmin(req, res, next);
            expect(res._redirected).toBe('/login/');
        });

        it('redireciona quando perfilId é 1 (cliente comum tenta acessar admin)', async () => {
            mockExecutaComando.mockResolvedValueOnce([ROW_CLIENTE]);
            const { req, res, next } = mockReqRes({ usuarioLogado: '5' });
            await authMiddleware.validarAdmin(req, res, next);
            expect(res._redirected).toBe('/login/');
            expect(next).not.toHaveBeenCalled();
        });

        it('redireciona quando perfilId é 2 (perfil não autorizado)', async () => {
            mockExecutaComando.mockResolvedValueOnce([ROW_PERFIL2]);
            const { req, res, next } = mockReqRes({ usuarioLogado: '10' });
            await authMiddleware.validarAdmin(req, res, next);
            expect(res._redirected).toBe('/login/');
        });

        it('redireciona quando admin está inativo (cliStatus=0)', async () => {
            mockExecutaComando.mockResolvedValueOnce([ROW_INATIVO]);
            const { req, res, next } = mockReqRes({ usuarioLogado: '10' });
            await authMiddleware.validarAdmin(req, res, next);
            expect(res._redirected).toBe('/login/');
        });

        it('chama next() para admin ativo com perfilId 3', async () => {
            mockExecutaComando.mockResolvedValueOnce([ROW_ADMIN]);
            const { req, res, next } = mockReqRes({ usuarioLogado: '10' });
            await authMiddleware.validarAdmin(req, res, next);
            expect(next).toHaveBeenCalledTimes(1);
            expect(res._redirected).toBeNull();
        });

        it('popula res.locals.user com o objeto do usuário admin', async () => {
            mockExecutaComando.mockResolvedValueOnce([ROW_ADMIN]);
            const { req, res, next } = mockReqRes({ usuarioLogado: '10' });
            await authMiddleware.validarAdmin(req, res, next);
            expect(res.locals.user).toBeDefined();
            expect(res.locals.user.cliNome).toBe('Admin User');
            expect(res.locals.user.perfilId).toBe(3);
        });

        it('não popula res.locals.user quando acesso é negado', async () => {
            const { req, res, next } = mockReqRes({});
            await authMiddleware.validarAdmin(req, res, next);
            expect(res.locals.user).toBeUndefined();
        });

        it('não popula res.locals.user para cliente comum bloqueado', async () => {
            mockExecutaComando.mockResolvedValueOnce([ROW_CLIENTE]);
            const { req, res, next } = mockReqRes({ usuarioLogado: '5' });
            await authMiddleware.validarAdmin(req, res, next);
            expect(res.locals.user).toBeUndefined();
        });
    });
});
