const { mockExecutaComando } = require('../setup');

jest.mock('fs', () => ({
    existsSync: jest.fn()
}));

const fs = require('fs');
const ProdutoModel = require('../../models/ProdutoModel');

const BASE = '/srv/farmafipp/public/img/produtos/';
const PLACEHOLDER = '/img/produtos/barra-de-imagem.png';

function rowRead(pro_img) {
    return {
        idProduto: 1,
        pro_nome: 'Dipirona',
        descricao: 'Analgésico',
        lot_validade: '2026-12-31',
        pro_preco: 15,
        pro_quantidade: 100,
        cat_nome: 'Medicamentos',
        forn_nome: 'Fornecedor A',
        marca: 'EMS',
        lot_name: 'L1',
        pro_img,
        lot_id: 10
    };
}

function rowGet(pro_img) {
    return {
        idProduto: 5,
        pro_nome: 'Ibuprofeno',
        descricao: 'Anti-inflamatório',
        pro_validade: '2027-01-01',
        pro_preco: 18.9,
        pro_quantidade: 50,
        Categoria_Produto: 1,
        idFornecedor: 2,
        marca: 'Medley',
        pro_img
    };
}

describe('ProdutoModel — resolução da imagem do produto', () => {
    const GLOBAL_ANTERIOR = global.CAMINHO_IMG_ABS;

    beforeEach(() => {
        global.CAMINHO_IMG_ABS = BASE;
        fs.existsSync.mockReset();
    });

    afterAll(() => {
        global.CAMINHO_IMG_ABS = GLOBAL_ANTERIOR;
    });

    describe('Read()', () => {
        it('mantém a imagem quando o arquivo existe no diretório de busca', async () => {
            fs.existsSync.mockReturnValue(true);
            mockExecutaComando.mockResolvedValue([rowRead('PRD-123.jpg')]);

            const lista = await new ProdutoModel().Read();

            expect(lista[0].img).toBe('/img/produtos/PRD-123.jpg');
            expect(fs.existsSync).toHaveBeenCalledWith(BASE + 'PRD-123.jpg');
        });

        it('reproduz o sintoma: imagem cadastrada some e vira placeholder quando o existsSync não acha o arquivo no caminho resolvido', async () => {
            fs.existsSync.mockReturnValue(false);
            mockExecutaComando.mockResolvedValue([rowRead('PRD-123.jpg')]);

            const lista = await new ProdutoModel().Read();

            expect(lista[0].img).toBe(PLACEHOLDER);
        });

        it('usa o placeholder quando pro_img é null, sem nem consultar o disco', async () => {
            mockExecutaComando.mockResolvedValue([rowRead(null)]);

            const lista = await new ProdutoModel().Read();

            expect(lista[0].img).toBe(PLACEHOLDER);
            expect(fs.existsSync).not.toHaveBeenCalled();
        });

        it('busca sempre pelo nome do arquivo, ignorando qualquer caminho salvo no banco', async () => {
            fs.existsSync.mockReturnValue(true);
            mockExecutaComando.mockResolvedValue([rowRead('/img/produtos/PRD-123.jpg')]);

            const lista = await new ProdutoModel().Read();

            expect(lista[0].img).toBe('/img/produtos/PRD-123.jpg');
            expect(fs.existsSync).toHaveBeenCalledWith(BASE + 'PRD-123.jpg');
        });

        it('aceita pro_img salvo como BLOB/Buffer', async () => {
            fs.existsSync.mockReturnValue(true);
            mockExecutaComando.mockResolvedValue([rowRead(Buffer.from('PRD-123.jpg'))]);

            const lista = await new ProdutoModel().Read();

            expect(lista[0].img).toBe('/img/produtos/PRD-123.jpg');
            expect(fs.existsSync).toHaveBeenCalledWith(BASE + 'PRD-123.jpg');
        });

        it('ignora espaços em volta do nome do arquivo', async () => {
            fs.existsSync.mockReturnValue(true);
            mockExecutaComando.mockResolvedValue([rowRead('  PRD-123.jpg  ')]);

            const lista = await new ProdutoModel().Read();

            expect(lista[0].img).toBe('/img/produtos/PRD-123.jpg');
            expect(fs.existsSync).toHaveBeenCalledWith(BASE + 'PRD-123.jpg');
        });

        it('resolve a imagem de cada produto independentemente numa lista', async () => {
            fs.existsSync.mockImplementation((caminho) => caminho === BASE + 'existe.jpg');
            mockExecutaComando.mockResolvedValue([
                rowRead('existe.jpg'),
                { ...rowRead('sumiu.jpg'), idProduto: 2, pro_nome: 'Amoxicilina' }
            ]);

            const lista = await new ProdutoModel().Read();

            expect(lista[0].img).toBe('/img/produtos/existe.jpg');
            expect(lista[1].img).toBe(PLACEHOLDER);
        });
    });

    describe('Get()', () => {
        it('resolve a imagem do produto encontrado', async () => {
            fs.existsSync.mockReturnValue(true);
            mockExecutaComando.mockResolvedValue([rowGet('ibu.png')]);

            const produto = await new ProdutoModel().Get(5);

            expect(produto.img).toBe('/img/produtos/ibu.png');
            expect(fs.existsSync).toHaveBeenCalledWith(BASE + 'ibu.png');
        });

        it('usa o placeholder quando o arquivo da imagem não está mais no caminho de busca', async () => {
            fs.existsSync.mockReturnValue(false);
            mockExecutaComando.mockResolvedValue([rowGet('ibu.png')]);

            const produto = await new ProdutoModel().Get(5);

            expect(produto.img).toBe(PLACEHOLDER);
        });
    });
});
