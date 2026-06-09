document.addEventListener("DOMContentLoaded", function(){

    carregarVendas();
    let input = document.querySelector("#txtSearch");
    let btnExportar = document.querySelector("#btnExportar");

    btnExportar.addEventListener("click", function(){
        let wb = XLSX.utils.table_to_book(document.getElementById("tabelaPedidos"));
        XLSX.writeFile(wb, "vendas.xlsx");
    })

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

    // Busca enquanto o usuário digita (com pequeno atraso para não
    // disparar uma consulta ao banco a cada tecla)
    let debounceTimer;
    input.addEventListener("keyup", function(){
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function(){
            buscarVendas(input.value);
        }, 350);
    });

    function carregarVendas(params){
        fetch("/venda/listar" + (params ? "?produto=" + params: ""))
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
                <td class="ps-3">${vendaId}</td>
                <td class="text-end">${vendaValor.toFixed(2)}</td>
                <td>${itemNome}</td>
                <td class="text-center">${itemQuant}</td>
                <td class="text-end">${itemValor.toFixed(2)}</td>
                <td class="text-end pe-3">${itemValorTotal.toFixed(2)}</td>
            </tr>`;
        }

        document.querySelector("#tabelaPedidos > tbody").innerHTML = html;
    }
})