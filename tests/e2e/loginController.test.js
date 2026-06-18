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
const LoginController = require('../../controllers/LoginController');

function mockReqRes(body = {}) {
    const res = {
        _cookies: {},
        _data: null,
        _rendered: null,
        cookie(name, value, opts) { this._cookies[name] = { value, opts }; },
        send(data) { this._data = data; return this; },
        render(view, data) { this._rendered = { view, data }; return this; }
    };
    const req = { body };
    return { req, res };
}

const VALID_CPF = '529.982.247-25';

const VALID_CADASTRO = {
    nome: 'João Silva',
    cpf: VALID_CPF,
    data: '1990-05-15',
    telefone: '11999998888',
    email: 'joao@test.com',
    senha: 'Senha@123',
    rua: 'Rua das Flores',
    numero: '100',
    complemento: 'Apto 1',
    bairro: 'Centro',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01001-000',
    uf: 'SP'
};

describe('LoginController', () => {
    const ctrl = new LoginController();

    describe('efetuarLogin', () => {
        it('retorna erro quando body está vazio', async () => {
            const { req, res } = mockReqRes({});
            await ctrl.efetuarLogin(req, res);
            expect(res._data.ok).toBe(false);
            expect(res._data.msg).toMatch(/e-mail|senha/i);
        });

        it('retorna erro quando apenas email é fornecido', async () => {
            const { req, res } = mockReqRes({ email: 'a@b.com' });
            await ctrl.efetuarLogin(req, res);
            expect(res._data.ok).toBe(false);
        });

        it('retorna erro quando email não é encontrado no banco', async () => {
            mockExecutaComando.mockResolvedValueOnce([]);
            const { req, res } = mockReqRes({ email: 'nao@existe.com', senha: '123' });
            await ctrl.efetuarLogin(req, res);
            expect(res._data.ok).toBe(false);
            expect(res._data.msg).toContain('Email');
        });

        it('retorna erro quando a senha está incorreta', async () => {
            mockExecutaComando.mockResolvedValueOnce([{
                idClinete: 1,
                cli_email: 'user@test.com',
                cli_senha: '$2b$10$hashedvalue',
                perfil_id: 1
            }]);
            bcrypt.compare.mockResolvedValueOnce(false);
            const { req, res } = mockReqRes({ email: 'user@test.com', senha: 'errada' });
            await ctrl.efetuarLogin(req, res);
            expect(res._data.ok).toBe(false);
            expect(res._data.msg).toContain('senha');
        });

        it('login bem-sucedido retorna ok:true com perfil do usuário', async () => {
            mockExecutaComando.mockResolvedValueOnce([{
                idClinete: 7,
                cli_email: 'user@test.com',
                cli_senha: '$2b$10$hashedvalue',
                perfil_id: 1
            }]);
            bcrypt.compare.mockResolvedValueOnce(true);
            const { req, res } = mockReqRes({ email: 'user@test.com', senha: 'correta' });
            await ctrl.efetuarLogin(req, res);
            expect(res._data.ok).toBe(true);
            expect(res._data.msg).toBeDefined();
        });

        it('login define cookie com httpOnly:true e signed:true', async () => {
            mockExecutaComando.mockResolvedValueOnce([{
                idClinete: 7,
                cli_email: 'user@test.com',
                cli_senha: '$2b$10$hashedvalue',
                perfil_id: 1
            }]);
            bcrypt.compare.mockResolvedValueOnce(true);
            const { req, res } = mockReqRes({ email: 'user@test.com', senha: 'correta' });
            await ctrl.efetuarLogin(req, res);
            expect(res._cookies['usuarioLogado']).toBeDefined();
            expect(res._cookies['usuarioLogado'].opts.httpOnly).toBe(true);
            expect(res._cookies['usuarioLogado'].opts.signed).toBe(true);
        });

        it('cookie contém o ID numérico do usuário — não email nem senha', async () => {
            mockExecutaComando.mockResolvedValueOnce([{
                idClinete: 99,
                cli_email: 'admin@test.com',
                cli_senha: '$2b$10$hash',
                perfil_id: 3
            }]);
            bcrypt.compare.mockResolvedValueOnce(true);
            const { req, res } = mockReqRes({ email: 'admin@test.com', senha: 'correta' });
            await ctrl.efetuarLogin(req, res);
            const cookieValue = res._cookies['usuarioLogado'].value;
            expect(cookieValue).toBe(99);
            expect(cookieValue).not.toBe('admin@test.com');
        });

        it('bcrypt.compare é usado para comparar senhas — nunca compara texto claro', async () => {
            mockExecutaComando.mockResolvedValueOnce([{
                idClinete: 3,
                cli_email: 'c@d.com',
                cli_senha: '$2b$10$hashedvalue',
                perfil_id: 1
            }]);
            bcrypt.compare.mockResolvedValueOnce(false);
            const { req, res } = mockReqRes({ email: 'c@d.com', senha: 'qualquersenha' });
            await ctrl.efetuarLogin(req, res);
            expect(bcrypt.compare).toHaveBeenCalledWith('qualquersenha', '$2b$10$hashedvalue');
        });
    });

    describe('cadastrar', () => {
        it('rejeita quando dados pessoais estão incompletos (nome vazio)', async () => {
            const { req, res } = mockReqRes({ ...VALID_CADASTRO, nome: '' });
            await ctrl.cadastrar(req, res);
            expect(res._data.ok).toBe(false);
            expect(res._data.msg).toContain('dados pessoais');
        });

        it('rejeita quando email está ausente', async () => {
            const { req, res } = mockReqRes({ ...VALID_CADASTRO, email: '' });
            await ctrl.cadastrar(req, res);
            expect(res._data.ok).toBe(false);
        });

        it('rejeita quando data de nascimento está ausente', async () => {
            const { req, res } = mockReqRes({ ...VALID_CADASTRO, data: '' });
            await ctrl.cadastrar(req, res);
            expect(res._data.ok).toBe(false);
        });

        it('rejeita quando dados de endereço estão incompletos (rua vazia)', async () => {
            const { req, res } = mockReqRes({ ...VALID_CADASTRO, rua: '' });
            await ctrl.cadastrar(req, res);
            expect(res._data.ok).toBe(false);
            expect(res._data.msg).toContain('endereço');
        });

        it('rejeita quando bairro está vazio', async () => {
            const { req, res } = mockReqRes({ ...VALID_CADASTRO, bairro: '' });
            await ctrl.cadastrar(req, res);
            expect(res._data.ok).toBe(false);
        });

        it('rejeita CPF inválido (todos dígitos iguais)', async () => {
            const { req, res } = mockReqRes({ ...VALID_CADASTRO, cpf: '111.111.111-11' });
            await ctrl.cadastrar(req, res);
            expect(res._data.ok).toBe(false);
            expect(res._data.msg).toBe('CPF inválido');
        });

        it('rejeita CPF com formato incorreto', async () => {
            const { req, res } = mockReqRes({ ...VALID_CADASTRO, cpf: '123.456.789-00' });
            await ctrl.cadastrar(req, res);
            expect(res._data.ok).toBe(false);
        });

        it('rejeita quando CPF já está cadastrado', async () => {
            mockExecutaComando.mockResolvedValueOnce([{
                idClinete: 1, cli_nome: 'Outro', cli_status: 1, cli_cpf: '52998224725',
                cli_email: 'outro@test.com', cli_senha: 'hash', cli_telefone: '11',
                cli_nascimento: '2000-01-01', perfil_id: 1
            }]);
            mockExecutaComando.mockResolvedValueOnce([]);
            const { req, res } = mockReqRes(VALID_CADASTRO);
            await ctrl.cadastrar(req, res);
            expect(res._data.ok).toBe(false);
            expect(res._data.msg).toContain('CPF');
        });

        it('rejeita quando email já está cadastrado', async () => {
            mockExecutaComando.mockResolvedValueOnce([]);
            mockExecutaComando.mockResolvedValueOnce([{
                idClinete: 2, cli_nome: 'Outro', cli_status: 1, cli_cpf: '00000000000',
                cli_email: 'joao@test.com', cli_senha: 'hash', cli_telefone: '11',
                cli_nascimento: '2000-01-01', perfil_id: 1
            }]);
            const { req, res } = mockReqRes(VALID_CADASTRO);
            await ctrl.cadastrar(req, res);
            expect(res._data.ok).toBe(false);
            expect(res._data.msg).toContain('Email');
        });

        it('rejeita quando CPF e email ambos duplicados — mensagem lista ambos', async () => {
            mockExecutaComando.mockResolvedValueOnce([{
                idClinete: 1, cli_nome: 'X', cli_status: 1, cli_cpf: '52998224725',
                cli_email: 'joao@test.com', cli_senha: 'x', cli_telefone: '11',
                cli_nascimento: '2000-01-01', perfil_id: 1
            }]);
            mockExecutaComando.mockResolvedValueOnce([{
                idClinete: 1, cli_nome: 'X', cli_status: 1, cli_cpf: '52998224725',
                cli_email: 'joao@test.com', cli_senha: 'x', cli_telefone: '11',
                cli_nascimento: '2000-01-01', perfil_id: 1
            }]);
            const { req, res } = mockReqRes(VALID_CADASTRO);
            await ctrl.cadastrar(req, res);
            expect(res._data.ok).toBe(false);
            expect(res._data.msg).toContain('CPF');
            expect(res._data.msg).toContain('Email');
        });

        it('cadastro bem-sucedido retorna ok:true', async () => {
            mockExecutaComando.mockResolvedValueOnce([]);
            mockExecutaComando.mockResolvedValueOnce([]);
            bcrypt.hash.mockResolvedValueOnce('$2b$10$hashedpassword');
            mockExecutaComandoLastInserted.mockResolvedValueOnce(10);
            mockExecutaComandoNonQuery.mockResolvedValueOnce(true);
            const { req, res } = mockReqRes(VALID_CADASTRO);
            await ctrl.cadastrar(req, res);
            expect(res._data.ok).toBe(true);
            expect(res._data.msg).toContain('sucesso');
        });

        it('senha não é armazenada em texto claro — bcrypt.hash é chamado', async () => {
            mockExecutaComando.mockResolvedValueOnce([]);
            mockExecutaComando.mockResolvedValueOnce([]);
            bcrypt.hash.mockResolvedValueOnce('$2b$10$hashedpassword');
            mockExecutaComandoLastInserted.mockResolvedValueOnce(11);
            mockExecutaComandoNonQuery.mockResolvedValueOnce(true);
            const { req, res } = mockReqRes(VALID_CADASTRO);
            await ctrl.cadastrar(req, res);
            expect(bcrypt.hash).toHaveBeenCalledWith(VALID_CADASTRO.senha, 10);
            const [, insertValues] = mockExecutaComandoLastInserted.mock.calls[0];
            expect(insertValues).not.toContain(VALID_CADASTRO.senha);
            expect(insertValues.some(v => typeof v === 'string' && v.startsWith('$2b$'))).toBe(true);
        });

        it('retorna erro quando Create() do cliente retorna 0 (falsy)', async () => {
            mockExecutaComando.mockResolvedValueOnce([]);
            mockExecutaComando.mockResolvedValueOnce([]);
            bcrypt.hash.mockResolvedValueOnce('$2b$10$hash');
            mockExecutaComandoLastInserted.mockResolvedValueOnce(0);
            const { req, res } = mockReqRes(VALID_CADASTRO);
            await ctrl.cadastrar(req, res);
            expect(res._data.ok).toBe(false);
            expect(res._data.msg).toContain('cliente');
        });

        it('retorna erro quando Create() do endereço falha', async () => {
            mockExecutaComando.mockResolvedValueOnce([]);
            mockExecutaComando.mockResolvedValueOnce([]);
            bcrypt.hash.mockResolvedValueOnce('$2b$10$hash');
            mockExecutaComandoLastInserted.mockResolvedValueOnce(12);
            mockExecutaComandoNonQuery.mockResolvedValueOnce(false);
            const { req, res } = mockReqRes(VALID_CADASTRO);
            await ctrl.cadastrar(req, res);
            expect(res._data.ok).toBe(false);
            expect(res._data.msg).toContain('endereço');
        });

        it('retorna erro genérico quando o banco lança exceção', async () => {
            mockExecutaComando.mockResolvedValueOnce([]);
            mockExecutaComando.mockResolvedValueOnce([]);
            bcrypt.hash.mockResolvedValueOnce('$2b$10$hash');
            mockExecutaComandoLastInserted.mockRejectedValueOnce(new Error('DB error'));
            const { req, res } = mockReqRes(VALID_CADASTRO);
            await ctrl.cadastrar(req, res);
            expect(res._data.ok).toBe(false);
        });
    });
});
