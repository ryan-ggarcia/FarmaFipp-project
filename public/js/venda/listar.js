document.addEventListener("DOMContentLoaded", function(){
    const btnBuscar = document.getElementById("btnBuscar");
    const txtSearch = document.getElementById("txtSearch");

    if (btnBuscar) {
        btnBuscar.addEventListener("click", buscarVendas);
    }

    if (txtSearch) {
        txtSearch.addEventListener("keydown", function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                buscarVendas();
            }
        });
    }

    function buscarVendas(){
        const vendaId = txtSearch ? txtSearch.value.trim() : "";

        if (vendaId) {
            listarVendaId(vendaId);
            return;
        }

        listarVendas();
    }

    function listarVendas(){
        fetch('/venda/listar')
        .then(res =>{
            if (!res.ok) {
                throw new Error('Falha ao listar vendas: HTTP ' + res.status);
            }
            return res.json();
        })
        .then(data =>{
            montarTabela(data);
        })
        .catch(error => {
            console.error(error);
        })
    }

    function montarTabela(cartList){
        let html = "";

        for(let venda of cartList){
            const vendaId = venda.vendaId ?? venda.id_venda ?? "-";
            const vendaValor = Number(venda.vendaValor ?? venda.venda_valor_total ?? 0);
            const itemNome = venda.itemNome ?? venda.produto_nome ?? "-";
            const itemQuant = Number(venda.itemQuantidade ?? venda.itemQuant ?? venda.item_quant ?? 0);
            const itemValor = Number(venda.itemValor ?? venda.item_valor ?? 0);
            const itemValorTotal = Number(venda.itemValorTotal ?? venda.item_valor_total ?? 0);

            html +=
            `
            <tr>
                <td>${vendaId}</td>
                <td>${vendaValor.toFixed(2)}</td>
                <td>${itemNome}</td>
                <td>${itemQuant}</td>
                <td>${itemValor.toFixed(2)}</td>
                <td>${itemValorTotal.toFixed(2)}</td>
            </tr>`;
        }

        document.querySelector("#tabelaPedidos > tbody").innerHTML = html;
    }

    function listarVendaId(vendaId){
        fetch("/venda/listar/" + encodeURIComponent(vendaId))
        .then(res =>{
            if (!res.ok) {
                throw new Error('Falha ao listar venda por ID: HTTP ' + res.status);
            }
            return res.json();
        })
        .then(data =>{
            montarTabela(data);
        })
        .catch(error => {
            console.error(error);
        })
    }
})