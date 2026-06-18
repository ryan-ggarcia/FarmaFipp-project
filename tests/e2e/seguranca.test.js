jest.mock('bcrypt', () => ({
    compare: jest.fn(),
    hash: jest.fn()
}));

const {
    mockExecutaComando,
    mockExecutaComandoNonQuery,
    mockExecutaComandoLastInserted
} = require('../setup');
const bcrypt = require('bcrypt');

const LoginModel = require('../../models/LoginModel');
const ClienteModel = require('../../models/ClienteModel');
const LoginController = require('../../controllers/LoginController');
const ClienteController = require('../../controllers/ClienteController');
const authMiddleware = require('../../middleware/authMiddleware');

function simpleReqRes(body = {}) {
    const res = {
        _cookies: {},
        _data: null,
        cookie(name, value, opts) { this._cookies[name] = { value, opts }; },
        send(data) { this._data = data; return this; }
    };
    return { req: { body }, res };
}

function authReqRes(cookies = {}) {
    const res = {
        _redirected: null,
        locals: {},
        redirect(url) { this._redirected = url; }
    };
    return { req: { signedCookies: cookies }, res, next: jest.fn() };
}

const ROW_CLIENTE = {
    idClinete: 1, cli_nome: 'Teste', cli_status: 1,
    cli_cpf: '52998224725', cli_email: 'test@test.com', cli_senha: '$2b$10$hash',
    cli_telefone: '11', cli_nascimento: '1990-01-01', perfil_id: 1,
    end_id: null, end_rua: null, end_bairro: null, end_cidade: null,
    end_num: null, end_estado: null, end_uf: null, end_cep: null, end_complemento: null
};

const BASE_CADASTRO = {
    nome: 'Teste', cpf: '529.982.247-25', data: '1990-01-01',
    telefone: '11999', email: 'test@test.com', senha: 'Senha@123',
    rua: 'Rua', numero: '1', bairro: 'B', cidade: 'C', estado: 'SP', cep: '01001-000', uf: 'SP'
};

// ─── SQL Injection ───────────────────────────────────────────────────────────
describe('SQL Injection — Queries parametrizadas', () => {

    describe('LoginModel.verificar()', () => {
        it("payload \"' OR '1'='1'\" não é concatenado na SQL", async () => {
            const payload = "' OR '1'='1'; --";
            mockExecutaComando.mockResolvedValueOnce([]);
            await new LoginModel().verificar(payload);
            const [sql, valores] = mockExecutaComando.mock.calls[0];
            expect(sql).toContain('?');
            expect(valores[0]).toBe(payload);
            expect(sql).not.toContain(payload);
        });

        it('payload DROP TABLE não aparece na SQL enviada ao banco', async () => {
            mockExecutaComando.mockResolvedValueOnce([]);
            await new LoginModel().verificar("'; DROP TABLE cliente; --");
            const [sql] = mockExecutaComando.mock.calls[0];
            expect(sql).not.toContain('DROP');
        });
    });

    describe('ClienteModel.FindByCpf()', () => {
        it('CPF malicioso é tratado como valor parametrizado', async () => {
            const payload = "' OR 1=1; --";
            mockExecutaComando.mockResolvedValueOnce([]);
            await new ClienteModel().FindByCpf(payload);
            const [sql, valores] = mockExecutaComando.mock.calls[0];
            expect(sql).toContain('?');
            expect(sql).not.toContain(payload);
            expect(valores[0]).toBe(payload);
        });
    });

    describe('ClienteModel.FindByEmail()', () => {
        it('email malicioso é tratado como valor parametrizado', async () => {
            const payload = "admin'--";
            mockExecutaComando.mockResolvedValueOnce([]);
            await new ClienteModel().FindByEmail(payload);
            const [sql, valores] = mockExecutaComando.mock.calls[0];
            expect(sql).toContain('?');
            expect(sql).not.toContain(payload);
        });
    });

    describe('ClienteModel.Get()', () => {
        it('ID malicioso não é concatenado — evita "WHERE id=1 OR 1=1"', async () => {
            mockExecutaComando.mockResolvedValueOnce([]);
            await new ClienteModel().Get("1 OR 1=1");
            const [sql, valores] = mockExecutaComando.mock.calls[0];
            expect(sql).toContain('?');
            expect(sql).not.toContain('OR 1=1');
        });
    });

    describe('ClienteModel.Delete()', () => {
        it('payload de deleção em massa não é interpolado na SQL', async () => {
            mockExecutaComandoNonQuery.mockResolvedValueOnce(false);
            await new ClienteModel().Delete("1 OR 1=1");
            const [sql, valores] = mockExecutaComandoNonQuery.mock.calls[0];
            expect(sql).toContain('?');
            expect(sql).not.toContain('OR 1=1');
        });
    });
});

// ─── Segurança de Senhas ─────────────────────────────────────────────────────
describe('Segurança de Senhas — Hashing e Comparação', () => {

    it('cadastro nunca armazena senha em texto claro no banco', async () => {
        mockExecutaComando.mockResolvedValueOnce([]);
        mockExecutaComando.mockResolvedValueOnce([]);
        bcrypt.hash.mockResolvedValueOnce('$2b$10$securedhash');
        mockExecutaComandoLastInserted.mockResolvedValueOnce(1);
        mockExecutaComandoNonQuery.mockResolvedValueOnce(true);

        const { req, res } = simpleReqRes(BASE_CADASTRO);
        await new LoginController().cadastrar(req, res);
        const [, insertValues] = mockExecutaComandoLastInserted.mock.calls[0];
        expect(insertValues).not.toContain('Senha@123');
        expect(insertValues.some(v => typeof v === 'string' && v.startsWith('$2b$'))).toBe(true);
    });

    it('bcrypt.hash é chamado com custo 10 no cadastro', async () => {
        mockExecutaComando.mockResolvedValueOnce([]);
        mockExecutaComando.mockResolvedValueOnce([]);
        bcrypt.hash.mockResolvedValueOnce('$2b$10$securedhash');
        mockExecutaComandoLastInserted.mockResolvedValueOnce(2);
        mockExecutaComandoNonQuery.mockResolvedValueOnce(true);

        const { req, res } = simpleReqRes(BASE_CADASTRO);
        await new LoginController().cadastrar(req, res);
        expect(bcrypt.hash).toHaveBeenCalledWith('Senha@123', 10);
    });

    it('login usa bcrypt.compare — nunca compara senha em texto claro', async () => {
        mockExecutaComando.mockResolvedValueOnce([{
            idClinete: 1, cli_email: 'a@b.com',
            cli_senha: '$2b$10$hashedvalue', perfil_id: 1
        }]);
        bcrypt.compare.mockResolvedValueOnce(true);

        const { req, res } = simpleReqRes({ email: 'a@b.com', senha: 'Senha@123' });
        await new LoginController().efetuarLogin(req, res);
        expect(bcrypt.compare).toHaveBeenCalledWith('Senha@123', '$2b$10$hashedvalue');
    });

    it('senha incorreta retorna erro — bcrypt.compare com false', async () => {
        mockExecutaComando.mockResolvedValueOnce([{
            idClinete: 1, cli_email: 'a@b.com',
            cli_senha: '$2b$10$hashedvalue', perfil_id: 1
        }]);
        bcrypt.compare.mockResolvedValueOnce(false);

        const { req, res } = simpleReqRes({ email: 'a@b.com', senha: 'senhaerrada' });
        await new LoginController().efetuarLogin(req, res);
        expect(res._data.ok).toBe(false);
        expect(res._data.msg).toContain('senha');
    });
});

// ─── Segurança de Cookies ────────────────────────────────────────────────────
describe('Segurança de Cookies', () => {

    it('cookie de sessão é httpOnly — protegido contra XSS via document.cookie', async () => {
        mockExecutaComando.mockResolvedValueOnce([{
            idClinete: 7, cli_email: 'u@u.com',
            cli_senha: '$2b$10$hash', perfil_id: 1
        }]);
        bcrypt.compare.mockResolvedValueOnce(true);

        const { req, res } = simpleReqRes({ email: 'u@u.com', senha: 'pass' });
        await new LoginController().efetuarLogin(req, res);
        expect(res._cookies['usuarioLogado'].opts.httpOnly).toBe(true);
    });

    it('cookie de sessão é assinado — dificulta falsificação do valor', async () => {
        mockExecutaComando.mockResolvedValueOnce([{
            idClinete: 8, cli_email: 'v@v.com',
            cli_senha: '$2b$10$hash', perfil_id: 3
        }]);
        bcrypt.compare.mockResolvedValueOnce(true);

        const { req, res } = simpleReqRes({ email: 'v@v.com', senha: 'pass' });
        await new LoginController().efetuarLogin(req, res);
        expect(res._cookies['usuarioLogado'].opts.signed).toBe(true);
    });

    it('cookie armazena apenas o ID do usuário — sem dados sensíveis', async () => {
        mockExecutaComando.mockResolvedValueOnce([{
            idClinete: 42, cli_email: 'w@w.com',
            cli_senha: '$2b$10$hash', perfil_id: 1
        }]);
        bcrypt.compare.mockResolvedValueOnce(true);

        const { req, res } = simpleReqRes({ email: 'w@w.com', senha: 'pass' });
        await new LoginController().efetuarLogin(req, res);
        const value = res._cookies['usuarioLogado'].value;
        expect(value).toBe(42);
        expect(typeof value).toBe('number');
        expect(value).not.toBe('w@w.com');
    });
});

// ─── Controle de Acesso ──────────────────────────────────────────────────────
describe('Controle de Acesso — Middleware Auth', () => {

    it('rota admin bloqueia requisição sem cookie e redireciona para login', async () => {
        const { req, res, next } = authReqRes({});
        await authMiddleware.validarAdmin(req, res, next);
        expect(res._redirected).toBe('/login/');
        expect(next).not.toHaveBeenCalled();
    });

    it('rota admin bloqueia cliente comum (perfil 1) — escalada de privilégios impedida', async () => {
        mockExecutaComando.mockResolvedValueOnce([{ ...ROW_CLIENTE, perfil_id: 1 }]);
        const { req, res, next } = authReqRes({ usuarioLogado: '1' });
        await authMiddleware.validarAdmin(req, res, next);
        expect(res._redirected).toBe('/login/');
        expect(next).not.toHaveBeenCalled();
    });

    it('rota admin libera apenas perfil 3 (admin)', async () => {
        mockExecutaComando.mockResolvedValueOnce([{ ...ROW_CLIENTE, perfil_id: 3, cli_nome: 'Admin' }]);
        const { req, res, next } = authReqRes({ usuarioLogado: '1' });
        await authMiddleware.validarAdmin(req, res, next);
        expect(next).toHaveBeenCalledTimes(1);
        expect(res._redirected).toBeNull();
    });

    it('usuário inativo (status=0) não acessa rota de cliente', async () => {
        mockExecutaComando.mockResolvedValueOnce([{ ...ROW_CLIENTE, cli_status: 0 }]);
        const { req, res, next } = authReqRes({ usuarioLogado: '1' });
        await authMiddleware.validarCliente(req, res, next);
        expect(res._redirected).toBe('/login/');
    });

    it('usuário inativo (status=0) não acessa rota de admin', async () => {
        mockExecutaComando.mockResolvedValueOnce([{ ...ROW_CLIENTE, cli_status: 0, perfil_id: 3 }]);
        const { req, res, next } = authReqRes({ usuarioLogado: '1' });
        await authMiddleware.validarAdmin(req, res, next);
        expect(res._redirected).toBe('/login/');
    });
});

// ─── Validação de CPF ────────────────────────────────────────────────────────
describe('Validação de CPF — Prevenção de Dados Inválidos', () => {

    const ctrl = new LoginController();

    it.each([
        ['111.111.111-11', 'todos dígitos iguais'],
        ['000.000.000-00', 'zeros'],
        ['999.999.999-99', 'noves'],
        ['123.456.789-09', 'dígito verificador errado'],
        ['',               'CPF vazio'],
        ['abc.def.ghi-jk', 'letras no CPF'],
        ['123.456.7',      'CPF incompleto']
    ])('rejeita CPF "%s" (%s)', async (cpfInvalido) => {
        const res = { _data: null, send(d) { this._data = d; } };
        const req = { body: { ...BASE_CADASTRO, cpf: cpfInvalido } };
        await ctrl.cadastrar(req, res);
        expect(res._data.ok).toBe(false);
    });

    it('aceita CPF válido com formatação (529.982.247-25)', async () => {
        mockExecutaComando.mockResolvedValueOnce([]);
        mockExecutaComando.mockResolvedValueOnce([]);
        bcrypt.hash.mockResolvedValueOnce('$2b$10$hash');
        mockExecutaComandoLastInserted.mockResolvedValueOnce(50);
        mockExecutaComandoNonQuery.mockResolvedValueOnce(true);
        const res = { _data: null, send(d) { this._data = d; } };
        const req = { body: { ...BASE_CADASTRO, cpf: '529.982.247-25' } };
        await ctrl.cadastrar(req, res);
        expect(res._data.ok).toBe(true);
    });

    it('aceita CPF válido sem formatação (52998224725)', async () => {
        mockExecutaComando.mockResolvedValueOnce([]);
        mockExecutaComando.mockResolvedValueOnce([]);
        bcrypt.hash.mockResolvedValueOnce('$2b$10$hash');
        mockExecutaComandoLastInserted.mockResolvedValueOnce(51);
        mockExecutaComandoNonQuery.mockResolvedValueOnce(true);
        const res = { _data: null, send(d) { this._data = d; } };
        const req = { body: { ...BASE_CADASTRO, cpf: '52998224725' } };
        await ctrl.cadastrar(req, res);
        expect(res._data.ok).toBe(true);
    });
});

// ─── Unicidade de Dados ──────────────────────────────────────────────────────
describe('Unicidade — CPF e Email não podem ser duplicados', () => {

    const EXISTING = {
        idClinete: 99, cli_nome: 'Existente', cli_status: 1,
        cli_cpf: '52998224725', cli_email: 'test@test.com', cli_senha: 'hash',
        cli_telefone: '11', cli_nascimento: '1990-01-01', perfil_id: 1
    };

    it('rejeita cadastro quando CPF duplicado — mensagem específica', async () => {
        mockExecutaComando.mockResolvedValueOnce([EXISTING]);
        mockExecutaComando.mockResolvedValueOnce([]);
        const ctrl = new ClienteController();
        const res = { _data: null, send(d) { this._data = d; } };
        await ctrl.cadastrar({ body: BASE_CADASTRO }, res);
        expect(res._data.ok).toBe(false);
        expect(res._data.msg).toContain('CPF');
    });

    it('rejeita cadastro quando email duplicado — mensagem específica', async () => {
        mockExecutaComando.mockResolvedValueOnce([]);
        mockExecutaComando.mockResolvedValueOnce([EXISTING]);
        const ctrl = new ClienteController();
        const res = { _data: null, send(d) { this._data = d; } };
        await ctrl.cadastrar({ body: BASE_CADASTRO }, res);
        expect(res._data.ok).toBe(false);
        expect(res._data.msg).toContain('Email');
    });

    it('quando CPF e email ambos duplicados — mensagem menciona os dois', async () => {
        mockExecutaComando.mockResolvedValueOnce([EXISTING]);
        mockExecutaComando.mockResolvedValueOnce([EXISTING]);
        const ctrl = new LoginController();
        const { req, res } = simpleReqRes(BASE_CADASTRO);
        await ctrl.cadastrar(req, res);
        expect(res._data.ok).toBe(false);
        expect(res._data.msg).toContain('CPF');
        expect(res._data.msg).toContain('Email');
    });

    it('permite cadastro quando CPF e email são únicos', async () => {
        mockExecutaComando.mockResolvedValueOnce([]);
        mockExecutaComando.mockResolvedValueOnce([]);
        bcrypt.hash.mockResolvedValueOnce('$2b$10$hash');
        mockExecutaComandoLastInserted.mockResolvedValueOnce(100);
        mockExecutaComandoNonQuery.mockResolvedValueOnce(true);
        const ctrl = new LoginController();
        const { req, res } = simpleReqRes(BASE_CADASTRO);
        await ctrl.cadastrar(req, res);
        expect(res._data.ok).toBe(true);
    });
});
