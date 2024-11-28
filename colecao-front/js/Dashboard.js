async function buscarCoins(){
    let options ={
        method: "GET",
        headers: {"Content-type": "application/json"}
    };
    const resultado = await fetch('http://localhost:8080/colecao-back/rest/coin/consultar', options);
    if(resultado.ok == true){
        let listaCoins = await resultado.json();
        preencherTabela(listaCoins);
    } else {
        alert("Não existem pessoas cadastradas na base.");
    }
}
buscarCoins();

async function preencherTabela(listaCoins) {
    let tbody1 = document.getElementById('tbody1');
    tbody1.innerText = '';

    for(let coin of listaCoins){

    }
    
}