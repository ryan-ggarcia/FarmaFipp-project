const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const fs = require('fs');
const fileType = require('file-type');
const ProdutoController = require('../controllers/ProdutoController');
const LoteController = require('../controllers/LoteController');
const ctrl = new ProdutoController();
const loteCtrl = new LoteController();

const PASTA_PRODUTOS = path.join(__dirname, '..', 'public', 'img', 'produtos');

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, PASTA_PRODUTOS);
    },
    filename: function (req, file, cb) {
        let nome = `PRD-` + Date.now();
        let ext = file.originalname.split('.').pop();
        cb(null, `${nome}.${ext}`);
    }
});

let upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de arquivo não permitido! Use JPG, PNG ou WebP.'), false);
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 }
});

const magicBytesValidator = async (req, res, next) => {
    if (!req.file) {
        return next();
    }
    try {
        const filePath = req.file.path;
        const type = await fileType.fromFile(filePath);

        if (!type || !['jpg', 'png', 'webp'].includes(type.ext) || !type.mime.startsWith('image/')) {
            fs.unlinkSync(filePath);
            return res.status(400).send({ ok: false, msg: 'Arquivo corrompido ou malicioso detectado. Operação cancelada.' });
        }
        next();
    } catch (error) {
        if(req.file && fs.existsSync(req.file.path)){
            fs.unlinkSync(req.file.path);
        }
        console.error("Erro na verificação de file-type:", error);
        return res.status(500).send({ ok: false, msg: 'Erro interno ao validar a imagem.' });
    }
};

router.get('/', ctrl.listar);
router.get('/cadastrar', ctrl.cadastrarView);
router.post('/cadastrar', upload.single('img'), magicBytesValidator, ctrl.cadastrar);
router.get('/cadastrarLote', loteCtrl.CadastroLoteView);
router.post('/cadastrarLote', loteCtrl.CadastroLote);
router.get('/listar', ctrl.listar);
router.get('/obter/:produtoId', ctrl.obterProduto);
router.get('/alterar/:id', ctrl.AlterarView);
router.post('/alterar', upload.single('img'), magicBytesValidator, ctrl.alterar);
router.post('/excluir', ctrl.excluir);


router.PASTA_PRODUTOS = PASTA_PRODUTOS;

module.exports = router;