const form = document.querySelector('#form');
const limpar = document.querySelector('#limpar');
const exibir = document.querySelector('#mostrar');
const principal = document.querySelector('.principal');
const inputFile = document.getElementById('arquivo');
const fileName = document.getElementById('nome-arquivo');
const idUsuario = localStorage.getItem("idUsuario");

let coin = {};


// Adiciona o nome do arquivo da imagem:
inputFile.addEventListener('change', function () {
    if (inputFile.files.length > 0) {
        fileName.textContent = inputFile.files[0].name;
    } else {
        fileName.textContent = 'Nenhum arquivo selecionado';
    }
});





// Botão de mostrar/ocultar:
document.querySelector('#mostrar').addEventListener('click', function () {
    const principal = document.querySelector('.principal');
    const mostrarLink = document.querySelector('#mostrar');

    // Alterna entre mostrar e ocultar
    if (principal.style.display === 'none' || principal.style.display === '') {
        principal.style.display = 'flex'; // Mostra o formulário
        mostrarLink.innerHTML = 'Ocultar'; // Muda o texto do link para 'Ocultar'
    } else {
        principal.style.display = 'none'; // Oculta o formulário
        mostrarLink.innerHTML = 'Mostrar'; // Muda o texto do link para 'Mostrar'
    }
});





// Limpa os campos do formulário de cadastrar/editar coin
limpar.addEventListener('click', (evento) => {
    evento.preventDefault();
    coin = {};
    form.reset();
    fileName.textContent = 'Nenhum arquivo selecionado';
});



// Listar coins:
async function buscarcoins() {
    let listacoins = {};
    let options = {
        method: "GET"
    };

    const response = await fetch('http://localhost:8080/colecao-back/rest/coin/consultar', options);

    if (response.status === 204) {
        alert("Nenhuma coin encontrada");
        return '';
    }
    const formData = await response.formData();

    const coinsMap = {};
    for (let [key, value] of formData.entries()) {
        const [idcoin, type] = value.name.split('-');
        if (!coinsMap[idcoin]) {
            coinsMap[idcoin] = { id: idcoin };
        }

        if (type === 'coin.json') {
            coinsMap[idcoin].coinVO = value;

        } else if (type === 'imagem.jpg') {
            coinsMap[idcoin].imagem = value;
        }
    }

    listacoins = Object.values(coinsMap);
    if (listacoins.length != 0) {
        preencherTabela(listacoins);
    } else {
        alert("Houve um problema na montagem do array de coins");
    }
}

buscarcoins();




// Preenchimento da tabela com os dados cadastrados/editados:
// Preenchendo as informações da coin e criando os botões:
async function preencherTabela(listacoins) {
    let tbody = document.getElementById('tbody');
    tbody.innerHTML = ''; // Limpa a tabela antes de preencher

    // Percorre as coins para adicionar as linhas à tabela
    for (let coin of listacoins) {
        let tr = tbody.insertRow();
        let td_imagem = tr.insertCell();
        let td_idcoin = tr.insertCell();
        let td_nome = tr.insertCell();
        let td_pais = tr.insertCell();
        let td_ano = tr.insertCell();
        let td_valor = tr.insertCell();
        let td_detalhes = tr.insertCell();
        let td_acoes = tr.insertCell();

        // Adicionando a imagem da coin, caso exista
        if (coin.imagem) {
            const imgUrl = URL.createObjectURL(coin.imagem);
            const img = document.createElement('img');
            img.src = imgUrl;
            img.style.width = '80px';
            td_imagem.appendChild(img);
        }

        // Preenchendo as informações da coin
        if (coin.coinVO) {
            const coinJson = await coin.coinVO.text();
            const coinData = JSON.parse(coinJson)[0]; // Acessando o primeiro objeto do array

            td_idcoin.innerText = coinData.idcoin || 'Não informado';
            td_nome.innerText = coinData.nome || 'Não informado';
            td_pais.innerText = coinData.pais || 'Não informado';
            td_ano.innerText = coinData.ano || 'Não informado';
            td_valor.innerText = coinData.valor || 'Não informado';
            td_detalhes.innerText = coinData.detalhes || 'Não informado';

            // Criando o botão de editar
            // Dentro da função preencherTabela, ao criar o botão "Editar"
            let editar = document.createElement('button');
            editar.textContent = 'Editar';
            editar.style.height = '30px';
            editar.style.width = '100px';
            editar.style.margin = '5px';
            editar.style.padding = '2px';
            editar.style.background = '#9e9e9e';
            editar.style.border = '2px solid black';
            editar.style.borderRadius = '10px';
            editar.style.cursor = 'pointer';

            // Passando a coin completa para a função editarcoin
            editar.addEventListener('click', () => editarcoin(coin));  // Aqui a coin selecionada é passada para editarcoin

            td_acoes.appendChild(editar);


            // Criando o botão de excluir
            let excluir = document.createElement('button');
            excluir.textContent = 'Excluir';
            excluir.style.height = '30px';
            excluir.style.width = '100px';
            excluir.style.margin = '5px';
            excluir.style.padding = '2px';
            excluir.style.background = '#9e9e9e';
            excluir.style.border = '2px solid black';
            excluir.style.borderRadius = '10px';
            excluir.style.cursor = 'pointer';

            // Usando addEventListener para chamar a função de exclusão com o idcoin
            excluir.addEventListener('click', () => excluircoin(coinData.idcoin)); // Passando apenas o idcoin

            td_acoes.appendChild(excluir);
        }
    }
}









/* EXCLUIR coin (TABELA)*/
async function excluircoin(idcoin) {
    if (!idcoin) {
        console.log("idcoin não foi passado corretamente.");
        return;
    }

    console.log('Excluindo coin com ID:', idcoin); // Verifique se o id está correto

    let options = {
        method: "DELETE",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({
            idcoin: idcoin
        })
    };

    const resultado = await fetch('http://localhost:8080/colecao-back/rest/coin/atualizar', options);
    if (resultado.ok == true) {
        alert("coin atualizada");
        coin = {};  // Limpa os dados da coin
        form.reset();
        fileName.textContent = 'Nenhum arquivo selecionado';
        buscarcoins();
    } else {
        alert("Houve um problema na atualização da coin");
    }

}









// Gravar coin na tabela:
form.addEventListener('submit', (evento) => {
    evento.preventDefault();

    const fileInput = document.getElementById('arquivo');
    const idcoin = coin.idcoin;
    const nome = document.getElementById('nome').value;
    const pais = document.getElementById('pais').value;
    const ano = document.getElementById('ano').value;
    const valor = document.getElementById('valor').value;
    const detalhes = document.getElementById('detalhes').value;

    const MAX_FILE_SIZE = 1 * 1024 * 1024;
    const file = fileInput.files[0];

    if (file != undefined && file.size > MAX_FILE_SIZE) {
        alert('O arquivo é muito grande. Tamanho máximo permitido: 1MB');
        return;
    }

    const coinVO = {
        idcoin: idcoin,
        nome: nome,
        pais: pais,
        ano: ano,
        valor: valor,
        detalhes: detalhes,
        idUsuario: sessionStorage.getItem("idUsuario")
    }

    const coinJsonBlob = new Blob([JSON.stringify(coinVO)], { type: 'application/json' });

    const formData = new FormData();
    if (file != undefined) {
        formData.append('file', file);
    } else {
        formData.append('file', []);
    }
    formData.append('coinVO', coinJsonBlob);

    if (idcoin != undefined) {
        atualizarcoin(formData);
    } else {
        cadastrarcoin(formData);
    }
})









// Cadastrar coin:
async function cadastrarcoin(formData, idUsuario) {
    try {
        idUsuario = 1;
        // Enviar a requisição para o servidor
        const response = await fetch('http://localhost:8080/colecao-back/rest/coin/cadastrar/' + idUsuario, {
            method: "POST",
            body: formData
        });

        console.log('Resposta do servidor:', response);  // Verificando a resposta do servidor

        // Verificando se a resposta é OK (status 200-299)
        if (!response.ok) {
            alert('Erro ao cadastrar coin');
            return;
        }

        // Verificar o tipo de conteúdo da resposta
        const contentType = response.headers.get("Content-Type");
        if (contentType && contentType.includes("application/json")) {
            const coinVO = await response.json();  // Processa a resposta JSON

            // Se a coin for cadastrada com sucesso, atualiza a lista de coins
            alert("Cadastro concluído!");
            coin = {};  // Limpa os dados da coin
            form.reset();  // Reseta o formulário
            fileName.textContent = 'Nenhum arquivo selecionado';  // Limpa o nome do arquivo
            buscarcoins(); // Atualiza a lista de coins
        } else {
            alert('Resposta do servidor não contém JSON válido.');
        }
    } catch (error) {
        console.error('Erro ao cadastrar coin:', error);
        alert('Erro ao cadastrar coin. Verifique a conexão com o servidor ou os dados enviados.');
    }
}







// Atualizar coin:
async function atualizarcoin(formData) {
    let options = {
        method: "PUT",
        body: formData
    };

    const resultado = await fetch('http://localhost:8080/Colecionador/rest/coin/atualizar', options);
    
    if (resultado.ok) {
        alert("coin atualizada");
        coin = {};  // Limpa os dados da coin
        form.reset();  // Reseta o formulário
        fileName.textContent = 'Nenhum arquivo selecionado';  // Limpa o nome do arquivo
        
        // Após atualizar, busque novamente as coins para garantir que a tabela está atualizada
        buscarcoins(); // Atualiza a lista de coins
    } else {
        alert("Houve um problema na atualização da coin");
    }
}





async function editarcoin(dados) {
    console.log("Dados recebidos para edição:", dados);  // Verifique os dados recebidos

    // Atualizar o título para "Editar coin"
    const formTitle = document.querySelector('#form-title');
    if (formTitle) {
        formTitle.innerText = 'Editar coin';  // Muda o título do formulário
    } else {
        console.error('Elemento #form-title não encontrado');
    }

    // Verificar se a coinVO existe antes de tentar acessar seus dados
    if (dados.coinVO) {
        // Ler o conteúdo do arquivo JSON (coinVO) que está em 'dados.coinVO'
        const coinJson = await dados.coinVO.text(); // Lê o conteúdo do arquivo
        const coinData = JSON.parse(coinJson)[0]; // Supondo que a coin seja um array, pegue o primeiro item

        // Preencher os campos do formulário com os dados da coin
        coin.idcoin = dados.id;  // Usando 'id' de dados, já que você passou 'id' diretamente
        document.querySelector('#nome').value = coinData.nome || '';  // Se não tiver nome, deixa em branco
        document.querySelector('#pais').value = coinData.pais || '';
        document.querySelector('#ano').value = coinData.ano || '';
        document.querySelector('#valor').value = coinData.valor || '';
        document.querySelector('#detalhes').value = coinData.detalhes || '';

        // Logar os valores preenchidos para verificação
        console.log("Dados no formulário após preenchimento:");
        console.log("Nome:", coinData.nome);
        console.log("País:", coinData.pais);
        console.log("Ano:", coinData.ano);
        console.log("Valor:", coinData.valor);
        console.log("Detalhes:", coinData.detalhes);
    } else {
        console.error("coinVO não encontrado nos dados recebidos");
    }

    // Exibir o formulário, caso esteja oculto
    const principal = document.querySelector('.principal');
    const exibir = document.querySelector('#mostrar');
    
    if (principal.style.display === 'none') {
        principal.style.display = 'flex';  // Exibe o formulário
        exibir.innerHTML = 'Ocultar';  // Atualiza o texto do botão para 'Ocultar'
    }
}












