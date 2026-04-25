const express = require('express');
const multer = require('multer');
const router = express.Router();
const ProdutoController = require('../controllers/ProdutoController');
const ctrl = new ProdutoController();

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/img/produtos');
    },
    filename: function (req, file, cb) {
        let nome = `PRD-` + Date.now();
        let ext = file.originalname.split('.').pop();
        cb(null, `${nome}.${ext}`);
    }
})

let upload = multer({ storage: storage });
router.get('/', ctrl.listar)
router.get('/cadastrar', ctrl.cadastrarView);
router.post('/cadastrar', upload.single('img'), ctrl.cadastrar);
router.post('/adicionar/:id', ctrl.AddNewLot);
router.get('/adicionar/:id', ctrl.AddView);

module.exports = router;