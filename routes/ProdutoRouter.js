const express = require('express');
const multer = require('multer');
const router = express.Router();
const ProdutoController = require('../controllers/ProdutoController');
const LoteController = require('../controllers/LoteController');
const ctrl = new ProdutoController();
const loteCtrl = new LoteController();

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/img/produtos');
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
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// Produto routes
router.get('/', ctrl.listar);
router.get('/cadastrar', ctrl.cadastrarView);
router.post('/cadastrar', upload.single('img'), ctrl.cadastrar);
router.get('/cadastrarLote', loteCtrl.CadastroLoteView);
router.post('/cadastrarLote', loteCtrl.CadastroLote);
router.get('/listar', ctrl.listar);
router.get('/obter/:produtoId', ctrl.obterProduto);
router.get('/alterar/:id', ctrl.AlterarView);
router.post('/alterar', upload.single('img'), ctrl.alterar);
router.post('/excluir', ctrl.excluir);


module.exports = router;