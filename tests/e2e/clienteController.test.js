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
const ClienteController = require('../../controllers/ClienteController');

function mockReqRes(body = {}, params = {}) {
    const res = {
        _status: 200,
        _data: null,
        _rendered: null,
        _redirected: null,
        status(c) { this._status = c; return this; },
        send(data) { this._data = data; return this; },
        render(view, data) { this._rendered = { view, data }; return this; },
        redirect(url) { this._redirected = url; }
    };
    const req = { body, params };
    return { req, res };
}

const CLIENTE_ROW = {
    idClinete: 1,
    cli_nome: 'José Silva',
    cli_status: 1,
    cli_cpf: '52998224725',
    cli_email: 'jose@test.com',
    cli_senha: '$2b$10$hash',
    cli_telefone: '11999998888',
    cli_nascimento: '1980-06-15',
    perfil_id: 1,
    end_id: 1,
    end_rua: 'Rua B',
    end_bairro: 'Bairro',
    end_cidade: 'Cidade',
    end_num: '10',
    end_estado: 'SP',
    end_uf: 'SP',
    end_cep: '01001-000',
    end_complemento: ''
};

const VALID_CPF = '529.982.247-25';

const VALID_CADASTRO = {
    nome: 'Ana Souza',
    cpf: VALID_CPF,
    data: '1995-08-10',
    telefone: '11988887777',
    email: 'ana@test.com',
    senha: 'Senha@123',
    rua: 'Rua C',
    numero: '50',
    complemento: '',
    bairro: 'Bairro D',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01001-000',
    uf: 'SP'
};

const VALID_ALTERAR = {
    id: '1',
    nome: 'José Atualizado',
    cpf: VALID_CPF,
    data: '1980-06-15',
    telefone: '11999998888',
    email: 'jose@test.com',
    senha: '$2b$10$hash',
    status: '1',
    endId: '1',
    rua: 'Rua Nova',
    num: '99',
    complemento: '',
    bairro: 'Bairro Novo',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '04040-000',
    uf: 'SP'
};

describe('ClienteController', () => {
    const ctrl = new ClienteController();

    beforeEach(() => {
        bcrypt.hash.mockClear();
        bcrypt.compare.mockClear();
    });

    // ─── listarView ──────────────────────────────────────────────────────────
    describe('listarView', () => {
        it('renderiza view com lista de clientes', async () => {
            mockExecutaComando.mockResolvedValueOnce([CLIENTE_ROW]);
            const { req, res } = mockReqRes();
            await ctrl.listarView(req, res);
            expect(res._rendered.view).toBe('clientes/listar');
            expect(res._rendered.data).toHaveProperty('lista');
            expect(res._rendered.data.lista).toHaveLength(1);
        });

        it('renderiza com lista vazia quando não há clientes', async () => {
            mockExecutaComando.mockResolvedValueOnce([]);
            const { req, res } = mockReqRes();
            await ctrl.listarView(req, res);
            expect(res._rendered.data.lista).toHaveLength(0);
        });

        it('view contém marcador de aba ativa', async () => {
            mockExecutaComando.mockResolvedValueOnce([]);
            const { req, res } = mockReqRes();
            await ctrl.listarView(req, res);
            expect(res._rendered.data.active).toBe('clientes');
        });
    });

    // ─── cadastrar ───────────────────────────────────────────────────────────
    describe('cadastrar', () => {
        it('rejeita quando nome está vazio', async () => {
            const { req, res } = mockReqRes({ ...VALID_CADASTRO, nome: '' });
            await ctrl.cadastrar(req, res);
            expect(res._data.ok).toBe(false);
        });

        it('rejeita quando email está vazio', async () => {
            const { req, res } = mockReqRes({ ...VALID_CADASTRO, email: '' });
            await ctrl.cadastrar(req, res);
            expect(res._data.ok).toBe(false);
        });

        it('rejeita quando senha está vazia', async () => {
            const { req, res } = mockReqRes({ ...VALID_CADASTRO, senha: '' });
            await ctrl.cadastrar(req, res);
            expect(res._data.ok).toBe(false);
        });

        it('rejeita quando rua está vazia', async () => {
            const { req, res } = mockReqRes({ ...VALID_CADASTRO, rua: '' });
            await ctrl.cadastrar(req, res);
            expect(res._data.ok).toBe(false);
            expect(res._data.msg).toContain('endereço');
        });

        it('rejeita quando cidade está vazia', async () => {
            const { req, res } = mockReqRes({ ...VALID_CADASTRO, cidade: '' });
            await ctrl.cadastrar(req, res);
            expect(res._data.ok).toBe(false);
        });

        it('rejeita CPF inválido (111.111.111-11)', async () => {
            const { req, res } = mockReqRes({ ...VALID_CADASTRO, cpf: '111.111.111-11' });
            await ctrl.cadastrar(req, res);
            expect(res._data.ok).toBe(false);
            expect(res._data.msg).toBe('CPF inválido');
        });

        it('rejeita CPF com dígito verificador errado', async () => {
            const { req, res } = mockReqRes({ ...VALID_CADASTRO, cpf: '123.456.789-09' });
            await ctrl.cadastrar(req, res);
            expect(res._data.ok).toBe(false);
        });

        it('rejeita CPF já cadastrado no banco', async () => {
            mockExecutaComando.mockResolvedValueOnce([CLIENTE_ROW]);
            mockExecutaComando.mockResolvedValueOnce([]);
            const { req, res } = mockReqRes(VALID_CADASTRO);
            await ctrl.cadastrar(req, res);
            expect(res._data.ok).toBe(false);
            expect(res._data.msg).toContain('CPF');
        });

        it('rejeita email já cadastrado no banco', async () => {
            mockExecutaComando.mockResolvedValueOnce([]);
            mockExecutaComando.mockResolvedValueOnce([CLIENTE_ROW]);
            const { req, res } = mockReqRes(VALID_CADASTRO);
            await ctrl.cadastrar(req, res);
            expect(res._data.ok).toBe(false);
            expect(res._data.msg).toContain('Email');
        });

        it('cadastra cliente e endereço com sucesso', async () => {
            mockExecutaComando.mockResolvedValueOnce([]);
            mockExecutaComando.mockResolvedValueOnce([]);
            bcrypt.hash.mockResolvedValueOnce('$2b$10$newhash');
            mockExecutaComandoLastInserted.mockResolvedValueOnce(20);
            mockExecutaComandoNonQuery.mockResolvedValueOnce(true);
            const { req, res } = mockReqRes(VALID_CADASTRO);
            await ctrl.cadastrar(req, res);
            expect(res._data.ok).toBe(true);
            expect(res._data.msg).toContain('sucesso');
        });

        it('cria hash da senha antes de persistir', async () => {
            mockExecutaComando.mockResolvedValueOnce([]);
            mockExecutaComando.mockResolvedValueOnce([]);
            bcrypt.hash.mockResolvedValueOnce('$2b$10$newhash');
            mockExecutaComandoLastInserted.mockResolvedValueOnce(21);
            mockExecutaComandoNonQuery.mockResolvedValueOnce(true);
            const { req, res } = mockReqRes(VALID_CADASTRO);
            await ctrl.cadastrar(req, res);
            expect(bcrypt.hash).toHaveBeenCalledWith(VALID_CADASTRO.senha, 10);
        });

        it('retorna erro quando Create() do cliente falha (retorna 0)', async () => {
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
            mockExecutaComandoLastInserted.mockResolvedValueOnce(22);
            mockExecutaComandoNonQuery.mockResolvedValueOnce(false);
            const { req, res } = mockReqRes(VALID_CADASTRO);
            await ctrl.cadastrar(req, res);
            expect(res._data.ok).toBe(false);
            expect(res._data.msg).toContain('endereço');
        });
    });

    // ─── alterar ─────────────────────────────────────────────────────────────
    describe('alterar', () => {
        it('rejeita quando id está vazio', async () => {
            const { req, res } = mockReqRes({ ...VALID_ALTERAR, id: '' });
            await ctrl.alterar(req, res);
            expect(res._data.ok).toBe(false);
        });

        it('rejeita quando nome está vazio', async () => {
            const { req, res } = mockReqRes({ ...VALID_ALTERAR, nome: '' });
            await ctrl.alterar(req, res);
            expect(res._data.ok).toBe(false);
        });

        it('rejeita quando email está vazio', async () => {
            const { req, res } = mockReqRes({ ...VALID_ALTERAR, email: '' });
            await ctrl.alterar(req, res);
            expect(res._data.ok).toBe(false);
        });

        it('rejeita quando endId está vazio', async () => {
            const { req, res } = mockReqRes({ ...VALID_ALTERAR, endId: '' });
            await ctrl.alterar(req, res);
            expect(res._data.ok).toBe(false);
        });

        it('rejeita quando rua está vazia', async () => {
            const { req, res } = mockReqRes({ ...VALID_ALTERAR, rua: '' });
            await ctrl.alterar(req, res);
            expect(res._data.ok).toBe(false);
        });

        it('rejeita CPF inválido na alteração', async () => {
            const { req, res } = mockReqRes({ ...VALID_ALTERAR, cpf: '111.111.111-11' });
            await ctrl.alterar(req, res);
            expect(res._data.ok).toBe(false);
            expect(res._data.msg).toBe('CPF inválido');
        });

        it('altera com sucesso sem rehashar senha quando ela não mudou', async () => {
            mockExecutaComando.mockResolvedValueOnce([{ ...CLIENTE_ROW, cli_senha: '$2b$10$hash' }]);
            mockExecutaComandoNonQuery.mockResolvedValueOnce(true);
            mockExecutaComandoNonQuery.mockResolvedValueOnce(true);
            const { req, res } = mockReqRes({ ...VALID_ALTERAR, senha: '$2b$10$hash' });
            await ctrl.alterar(req, res);
            expect(res._data.ok).toBe(true);
            expect(bcrypt.hash).not.toHaveBeenCalled();
        });

        it('aplica bcrypt.hash quando a senha foi alterada', async () => {
            mockExecutaComando.mockResolvedValueOnce([{ ...CLIENTE_ROW, cli_senha: '$2b$10$oldhash' }]);
            bcrypt.hash.mockResolvedValueOnce('$2b$10$newhash');
            mockExecutaComandoNonQuery.mockResolvedValueOnce(true);
            mockExecutaComandoNonQuery.mockResolvedValueOnce(true);
            const { req, res } = mockReqRes({ ...VALID_ALTERAR, senha: 'NovaSenha@123' });
            await ctrl.alterar(req, res);
            expect(res._data.ok).toBe(true);
            expect(bcrypt.hash).toHaveBeenCalledWith('NovaSenha@123', 10);
        });

        it('retorna erro quando Update do cliente falha', async () => {
            mockExecutaComando.mockResolvedValueOnce([{ ...CLIENTE_ROW, cli_senha: '$2b$10$hash' }]);
            mockExecutaComandoNonQuery.mockResolvedValueOnce(false);
            mockExecutaComandoNonQuery.mockResolvedValueOnce(true);
            const { req, res } = mockReqRes(VALID_ALTERAR);
            await ctrl.alterar(req, res);
            expect(res._data.ok).toBe(false);
            expect(res._data.msg).toContain('cliente');
        });

        it('retorna erro quando Update do endereço falha', async () => {
            mockExecutaComando.mockResolvedValueOnce([{ ...CLIENTE_ROW, cli_senha: '$2b$10$hash' }]);
            mockExecutaComandoNonQuery.mockResolvedValueOnce(true);
            mockExecutaComandoNonQuery.mockResolvedValueOnce(false);
            const { req, res } = mockReqRes(VALID_ALTERAR);
            await ctrl.alterar(req, res);
            expect(res._data.ok).toBe(false);
            expect(res._data.msg).toContain('endereço');
        });
    });

    // ─── excluir ─────────────────────────────────────────────────────────────
    describe('excluir', () => {
        it('exclui cliente e endereço com sucesso', async () => {
            mockExecutaComandoNonQuery.mockResolvedValueOnce(true);
            mockExecutaComandoNonQuery.mockResolvedValueOnce(true);
            const { req, res } = mockReqRes({ id: '5' });
            await ctrl.excluir(req, res);
            expect(res._data.ok).toBe(true);
            expect(res._data.msg).toContain('sucesso');
        });

        it('rejeita id igual a "0"', async () => {
            const { req, res } = mockReqRes({ id: '0' });
            await ctrl.excluir(req, res);
            expect(res._data.ok).toBe(false);
            expect(res._data.msg).toContain('inválido');
        });

        it('rejeita quando id está vazio', async () => {
            const { req, res } = mockReqRes({ id: '' });
            await ctrl.excluir(req, res);
            expect(res._data.ok).toBe(false);
        });

        it('rejeita quando id não é fornecido no body', async () => {
            const { req, res } = mockReqRes({});
            await ctrl.excluir(req, res);
            expect(res._data.ok).toBe(false);
        });

        it('retorna erro quando Delete do endereço falha', async () => {
            mockExecutaComandoNonQuery.mockResolvedValueOnce(false);
            mockExecutaComandoNonQuery.mockResolvedValueOnce(true);
            const { req, res } = mockReqRes({ id: '3' });
            await ctrl.excluir(req, res);
            expect(res._data.ok).toBe(false);
        });

        it('retorna erro quando Delete do cliente falha', async () => {
            mockExecutaComandoNonQuery.mockResolvedValueOnce(true);
            mockExecutaComandoNonQuery.mockResolvedValueOnce(false);
            const { req, res } = mockReqRes({ id: '4' });
            await ctrl.excluir(req, res);
            expect(res._data.ok).toBe(false);
        });
    });
});
