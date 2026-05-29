const Database = require('./utils/database');
const db = new Database();

(async () => {
  try {
    const total = await db.ExecutaComando("SELECT COUNT(*) total FROM produto WHERE COALESCE(prod_status, 'Ativo') = 'Ativo'", []);
    const comLote = await db.ExecutaComando("SELECT COUNT(DISTINCT p.idProduto) total FROM produto p INNER JOIN produto_lote pl ON p.idProduto = pl.produto_idProduto WHERE COALESCE(p.prod_status, 'Ativo') = 'Ativo'", []);
    const comLoteEqtd = await db.ExecutaComando("SELECT COUNT(DISTINCT p.idProduto) total FROM produto p INNER JOIN produto_lote pl ON p.idProduto = pl.produto_idProduto INNER JOIN Lote l ON pl.lote_lot_id = l.lot_id WHERE COALESCE(p.prod_status, 'Ativo') = 'Ativo' AND l.lot_qnt > 0", []);
    const comProQtd = await db.ExecutaComando("SELECT COUNT(*) total FROM produto WHERE COALESCE(prod_status, 'Ativo') = 'Ativo' AND pro_quantidade > 0", []);

    console.log({
      total: total[0]?.total ?? 0,
      comLote: comLote[0]?.total ?? 0,
      comLoteEqtd: comLoteEqtd[0]?.total ?? 0,
      comProQtd: comProQtd[0]?.total ?? 0,
    });
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
})();
