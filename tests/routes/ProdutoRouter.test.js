require('../setup');

const path = require('path');
const router = require('../../routes/ProdutoRouter');

describe('ProdutoRouter — pasta de upload das imagens', () => {
    it('expõe a pasta de upload como caminho absoluto', () => {
        expect(typeof router.PASTA_PRODUTOS).toBe('string');
        expect(path.isAbsolute(router.PASTA_PRODUTOS)).toBe(true);
    });

    it('aponta para public/img/produtos da raiz do projeto, sem depender do diretório de trabalho', () => {
        const esperado = path.join(__dirname, '..', '..', 'public', 'img', 'produtos');
        expect(path.normalize(router.PASTA_PRODUTOS)).toBe(path.normalize(esperado));
    });
});
