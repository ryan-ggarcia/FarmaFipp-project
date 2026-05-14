document.addEventListener('DOMContentLoaded', function () {
    const CHAVE_CARRINHO = 'cart';
    const CHAVE_CARRINHO_LEGADA = 'carrinho';
    const IMAGEM_PADRAO = '/img/produtos/barra-de-imagem.png';
    const TAXA_ENTREGA = 12.0;

    let listaCarrinho = [];

    const checkoutEmptyState = document.getElementById('checkoutEmptyState');
    const checkoutContent = document.getElementById('checkoutContent');
    const checkoutItemsList = document.getElementById('checkoutItemsList');
    const checkoutItemsLabel = document.getElementById('checkoutItemsLabel');
    const checkoutSubtotal = document.getElementById('checkoutSubtotal');
    const checkoutShipping = document.getElementById('checkoutShipping');
    const checkoutDiscount = document.getElementById('checkoutDiscount');
    const checkoutTotal = document.getElementById('checkoutTotal');
    const btnCheckoutClear = document.getElementById('btnCheckoutClear');
    const btnConfirmOrder = document.getElementById('btnConfirmOrder');
    const btnSimulateBack = document.getElementById('btnSimulateBack');

    carregarCarrinho();
    inicializarFormaPagamento();
    inicializarBotoes();
    atualizarTela();

    function carregarCarrinho() {
        const carrinhoAtual = localStorage.getItem(CHAVE_CARRINHO);
        const carrinhoLegado = localStorage.getItem(CHAVE_CARRINHO_LEGADA);
        const dados = carrinhoAtual || carrinhoLegado;

        if (!dados) {
            listaCarrinho = [];
            return;
        }

        try {
            const parsed = JSON.parse(dados);
            listaCarrinho = Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.warn('Carrinho invalido no localStorage:', error);
            listaCarrinho = [];
        }
    }

    function salvarCarrinho() {
        const serializado = JSON.stringify(listaCarrinho);
        localStorage.setItem(CHAVE_CARRINHO, serializado);
        localStorage.setItem(CHAVE_CARRINHO_LEGADA, serializado);
    }

    function limparCarrinhoStorage() {
        localStorage.removeItem(CHAVE_CARRINHO);
        localStorage.removeItem(CHAVE_CARRINHO_LEGADA);
    }

    function inicializarFormaPagamento() {
        const opcoes = document.querySelectorAll('.payment-option');
        opcoes.forEach(function (botao) {
            botao.addEventListener('click', function () {
                opcoes.forEach(function (item) {
                    item.classList.remove('active');
                });
                botao.classList.add('active');
            });
        });
    }

    function inicializarBotoes() {
        if (btnCheckoutClear) {
            btnCheckoutClear.addEventListener('click', limparCarrinho);
        }

        if (btnConfirmOrder) {
            btnConfirmOrder.addEventListener('click', gravarPedido);
        }

        if (btnSimulateBack) {
            btnSimulateBack.addEventListener('click', function () {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    }

    function formatarMoeda(valor) {
        return Number(valor || 0).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    }

    function normalizarQuantidade(valor) {
        const qtd = Number(valor || 0);
        if (!Number.isFinite(qtd) || qtd < 1) {
            return 1;
        }
        return qtd;
    }

    function calcularTotais() {
        let subtotal = 0;
        let totalItens = 0;

        for (let i = 0; i < listaCarrinho.length; i++) {
            const item = listaCarrinho[i];
            const preco = Number(item.preco || 0);
            const quantidade = normalizarQuantidade(item.quantidade);
            subtotal += preco * quantidade;
            totalItens += quantidade;
        }

        const desconto = subtotal >= 200 ? subtotal * 0.05 : 0;
        const frete = subtotal > 0 ? TAXA_ENTREGA : 0;
        const total = subtotal + frete - desconto;

        return {
            subtotal,
            desconto,
            frete,
            total,
            totalItens
        };
    }

    function atualizarContador() {
        const badge = document.getElementById('cartBadgeCount');
        if (!badge) {
            return;
        }

        let qtdBadge = 0;
        for (let i = 0; i < listaCarrinho.length; i++) {
            qtdBadge += normalizarQuantidade(listaCarrinho[i].quantidade);
        }

        badge.textContent = String(qtdBadge);
        badge.style.display = qtdBadge > 0 ? 'inline-block' : 'none';
    }

    function atualizarResumo() {
        const totais = calcularTotais();

        if (checkoutItemsLabel) {
            checkoutItemsLabel.textContent = totais.totalItens + ' item' + (totais.totalItens !== 1 ? 's' : '');
        }
        if (checkoutSubtotal) {
            checkoutSubtotal.textContent = formatarMoeda(totais.subtotal);
        }
        if (checkoutShipping) {
            checkoutShipping.textContent = formatarMoeda(totais.frete);
        }
        if (checkoutDiscount) {
            checkoutDiscount.textContent = '- ' + formatarMoeda(totais.desconto);
        }
        if (checkoutTotal) {
            checkoutTotal.textContent = formatarMoeda(totais.total);
        }
    }

    function abrirCarrinho() {
        if (!checkoutItemsList) {
            return;
        }

        if (listaCarrinho.length === 0) {
            checkoutItemsList.innerHTML = '';
            if (checkoutContent) {
                checkoutContent.classList.add('d-none');
            }
            if (checkoutEmptyState) {
                checkoutEmptyState.classList.remove('d-none');
            }
            return;
        }

        if (checkoutContent) {
            checkoutContent.classList.remove('d-none');
        }
        if (checkoutEmptyState) {
            checkoutEmptyState.classList.add('d-none');
        }

        let html = '';
        for (let i = 0; i < listaCarrinho.length; i++) {
            const item = listaCarrinho[i];
            const quantidade = normalizarQuantidade(item.quantidade);
            const preco = Number(item.preco || 0);
            const subtotal = quantidade * preco;
            const imagem = item.imagem || item.img || IMAGEM_PADRAO;
            const nome = item.nome || 'Produto sem nome';
            const descricao = item.descricao || 'Produto sem descricao';

            html += '<article class="checkout-item">'
                + '<img class="checkout-item-img" src="' + imagem + '" alt="' + nome + '" />'
                + '<div>'
                + '<h4 class="checkout-item-name">' + nome + '</h4>'
                + '<p class="checkout-item-meta">' + descricao + '</p>'
                + '<div class="checkout-item-controls">'
                + '<button type="button" class="qty-btn btn-diminuir" data-produto="' + item.id + '">-</button>'
                + '<span class="qty-value">' + quantidade + '</span>'
                + '<button type="button" class="qty-btn btn-aumentar" data-produto="' + item.id + '">+</button>'
                + '</div>'
                + '</div>'
                + '<div class="item-price-block">'
                + '<span class="line-price">' + formatarMoeda(preco) + ' cada</span>'
                + '<span class="line-subtotal">' + formatarMoeda(subtotal) + '</span>'
                + '<button type="button" class="btn-remove-item excluirCarrinho" data-produto="' + item.id + '">'
                + '<i class="bi bi-trash me-1"></i>Remover</button>'
                + '</div>'
                + '</article>';
        }

        checkoutItemsList.innerHTML = html;

        const botoesExcluir = document.querySelectorAll('.excluirCarrinho');
        const botoesAumentar = document.querySelectorAll('.btn-aumentar');
        const botoesDiminuir = document.querySelectorAll('.btn-diminuir');

        botoesExcluir.forEach(function (botao) {
            botao.addEventListener('click', excluirProdutoCarrinho);
        });

        botoesAumentar.forEach(function (botao) {
            botao.addEventListener('click', aumentarQuantidade);
        });

        botoesDiminuir.forEach(function (botao) {
            botao.addEventListener('click', diminuirQuantidade);
        });
    }

    function excluirProdutoCarrinho() {
        const produtoIdExcluir = this.dataset.produto;
        listaCarrinho = listaCarrinho.filter(function (item) {
            return String(item.id) !== String(produtoIdExcluir);
        });

        salvarCarrinho();
        atualizarTela();
    }

    function aumentarQuantidade() {
        const produtoId = this.dataset.produto;

        for (let i = 0; i < listaCarrinho.length; i++) {
            if (String(listaCarrinho[i].id) === String(produtoId)) {
                listaCarrinho[i].quantidade = normalizarQuantidade(listaCarrinho[i].quantidade) + 1;
                break;
            }
        }

        salvarCarrinho();
        atualizarTela();
    }

    function diminuirQuantidade() {
        const produtoId = this.dataset.produto;

        listaCarrinho = listaCarrinho
            .map(function (item) {
                if (String(item.id) === String(produtoId)) {
                    item.quantidade = normalizarQuantidade(item.quantidade) - 1;
                }
                return item;
            })
            .filter(function (item) {
                return Number(item.quantidade) > 0;
            });

        salvarCarrinho();
        atualizarTela();
    }

    function limparCarrinho() {
        listaCarrinho = [];
        limparCarrinhoStorage();
        atualizarTela();
    }

    function montarItensVenda() {
        const itens = [];

        for (let i = 0; i < listaCarrinho.length; i++) {
            const item = listaCarrinho[i];
            const quantidade = normalizarQuantidade(item.quantidade);
            const precoUnitario = Number(item.preco || 0);

            itens.push({
                id_produto: item.id,
                id_lote: item.id_lote || item.idLote || null,
                quantidade,
                preco_unitario: precoUnitario,
                subtotal: quantidade * precoUnitario
            });
        }

        return itens;
    }

    function gravarPedido() {
        if (listaCarrinho.length === 0) {
            window.alert('Nenhum produto adicionado ao carrinho!');
            return;
        }

        const botaoSelecionado = document.querySelector('.payment-option.active');
        const pagamentoCodigo = botaoSelecionado ? botaoSelecionado.dataset.payment : 'pix';
        const pagamentoTexto = botaoSelecionado ? botaoSelecionado.textContent.trim() : 'PIX';
        const totais = calcularTotais();
        const itens = montarItensVenda();

        if (btnConfirmOrder) {
            btnConfirmOrder.disabled = true;
            btnConfirmOrder.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Processando...';
        }

        fetch('/venda/confirmar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data: new Date().toISOString(),
                status: 'PENDENTE',
                pagamento: pagamentoCodigo,
                total: totais.total,
                subtotal: totais.subtotal,
                frete: totais.frete,
                desconto: totais.desconto,
                itens
            })
        })
            .then(function (resposta) {
                return resposta.json();
            })
            .then(function (corpo) {
                if (!corpo.ok) {
                    window.alert(corpo.msg || 'Erro ao registrar venda.');
                    return;
                }

                limparCarrinho();
                window.alert('Venda #' + corpo.vendaId + ' confirmada com sucesso! Pagamento: ' + pagamentoTexto + '.');
                window.location.href = '/usuario/shop';
            })
            .catch(function (erro) {
                console.error('Erro ao confirmar venda:', erro);
                window.alert('Nao foi possivel concluir a venda. Tente novamente.');
            })
            .finally(function () {
                if (btnConfirmOrder) {
                    btnConfirmOrder.disabled = false;
                    btnConfirmOrder.innerHTML = '<i class="bi bi-check2-circle me-1"></i> Finalizar pagamento';
                }
            });
    }

    function atualizarTela() {
        abrirCarrinho();
        atualizarContador();
        atualizarResumo();
    }
});
    