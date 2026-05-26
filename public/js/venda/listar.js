document.addEventListener("DOMContentLoaded", function(){

    carregarVendas();
    let input = document.querySelector("#txtSearch");
    let btn = document.querySelector("#btnBuscar");

    function buscarVendas(){
        let params = input.value;
        carregarVendas(params)
    }

    input.addEventListener("keydown", function(event){
        if(event.key === "Enter"){
            let params = input.value;
            buscarVendas(params)
        }
    });

    btn.addEventListener("click", function(){
        let params = input.value;
        buscarVendas(params)
    });

    function carregarVendas(params){
        fetch("/vendas/listar" + (params ? "?produto=" + params: ""))
        .then(res =>{
            return res.json()
        })
        .then(data => {
            montarTabela(data);
        })
    }

    function montarTabela(cartList){
        let html = ""

        if(!cartList || cartList.length === 0){
            html = `<tr><td colspan="6">Nenhuma venda encontrada!</td></tr>`;
            document.querySelector("#tabelaPedidos > tbody").innerHTML = html;
            return;
        }

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
})