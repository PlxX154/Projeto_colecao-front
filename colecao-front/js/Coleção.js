const form = document.querySelector('#form');
const limpar = document.querySelector('#limpar');
const exibir = document.querySelector('#mostrar');
const principal = document.querySelector('.principal');
const inputFile = document.getElementById('arquivo');
const fileName = document.getElementById('nome-arquivo');
const idUsuario = localStorage.getItem("idUsuario");

let moeda = {};


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





// Limpa os campos do formulário de cadastrar/editar moeda
limpar.addEventListener('click', (evento) => {
    evento.preventDefault();
    moeda = {};
    form.reset();
    fileName.textContent = 'Nenhum arquivo selecionado';
});



// Listar moedas:
async function buscarMoedas() {
    let listaMoedas = {};
    let options = {
        method: "GET"
    };

    const response = await fetch('http://localhost:8080/Colecionador/rest/moeda/listar', options);

    if (response.status === 204) {
        alert("Nenhuma moeda encontrada");
        return '';
    }
    const formData = await response.formData();

    const moedasMap = {};
    for (let [key, value] of formData.entries()) {
        const [idMoeda, type] = value.name.split('-');
        if (!moedasMap[idMoeda]) {
            moedasMap[idMoeda] = { id: idMoeda };
        }

        if (type === 'moeda.json') {
            moedasMap[idMoeda].moedaVO = value;

        } else if (type === 'imagem.jpg') {
            moedasMap[idMoeda].imagem = value;
        }
    }

    listaMoedas = Object.values(moedasMap);
    if (listaMoedas.length != 0) {
        preencherTabela(listaMoedas);
    } else {
        alert("Houve um problema na montagem do array de moedas");
    }
}

buscarMoedas();




// Preenchimento da tabela com os dados cadastrados/editados:
// Preenchendo as informações da moeda e criando os botões:
async function preencherTabela(listaMoedas) {
    let tbody = document.getElementById('tbody');
    tbody.innerHTML = ''; // Limpa a tabela antes de preencher

    // Percorre as moedas para adicionar as linhas à tabela
    for (let moeda of listaMoedas) {
        let tr = tbody.insertRow();
        let td_imagem = tr.insertCell();
        let td_idMoeda = tr.insertCell();
        let td_nome = tr.insertCell();
        let td_pais = tr.insertCell();
        let td_ano = tr.insertCell();
        let td_valor = tr.insertCell();
        let td_detalhes = tr.insertCell();
        let td_acoes = tr.insertCell();

        // Adicionando a imagem da moeda, caso exista
        if (moeda.imagem) {
            const imgUrl = URL.createObjectURL(moeda.imagem);
            const img = document.createElement('img');
            img.src = imgUrl;
            img.style.width = '80px';
            td_imagem.appendChild(img);
        }

        // Preenchendo as informações da moeda
        if (moeda.moedaVO) {
            const moedaJson = await moeda.moedaVO.text();
            const moedaData = JSON.parse(moedaJson)[0]; // Acessando o primeiro objeto do array

            td_idMoeda.innerText = moedaData.idMoeda || 'Não informado';
            td_nome.innerText = moedaData.nome || 'Não informado';
            td_pais.innerText = moedaData.pais || 'Não informado';
            td_ano.innerText = moedaData.ano || 'Não informado';
            td_valor.innerText = moedaData.valor || 'Não informado';
            td_detalhes.innerText = moedaData.detalhes || 'Não informado';

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

            // Passando a moeda completa para a função editarMoeda
            editar.addEventListener('click', () => editarMoeda(moeda));  // Aqui a moeda selecionada é passada para editarMoeda

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

            // Usando addEventListener para chamar a função de exclusão com o idMoeda
            excluir.addEventListener('click', () => excluirMoeda(moedaData.idMoeda)); // Passando apenas o idMoeda

            td_acoes.appendChild(excluir);
        }
    }
}









/* EXCLUIR MOEDA (TABELA)*/
async function excluirMoeda(idMoeda) {
    if (!idMoeda) {
        console.log("idMoeda não foi passado corretamente.");
        return;
    }

    console.log('Excluindo moeda com ID:', idMoeda); // Verifique se o id está correto

    let options = {
        method: "DELETE",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({
            idMoeda: idMoeda
        })
    };

    const resultado = await fetch('http://localhost:8080/Colecionador/rest/moeda/atualizar', options);
    if (resultado.ok == true) {
        alert("Moeda atualizada");
        moeda = {};  // Limpa os dados da moeda
        form.reset();
        fileName.textContent = 'Nenhum arquivo selecionado';
        buscarMoedas();
    } else {
        alert("Houve um problema na atualização da moeda");
    }

}









// Gravar moeda na tabela:
form.addEventListener('submit', (evento) => {
    evento.preventDefault();

    const fileInput = document.getElementById('arquivo');
    const idMoeda = moeda.idMoeda;
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

    const moedaVO = {
        idMoeda: idMoeda,
        nome: nome,
        pais: pais,
        ano: ano,
        valor: valor,
        detalhes: detalhes,
        idUsuario: sessionStorage.getItem("idUsuario")
    }

    const moedaJsonBlob = new Blob([JSON.stringify(moedaVO)], { type: 'application/json' });

    const formData = new FormData();
    if (file != undefined) {
        formData.append('file', file);
    } else {
        formData.append('file', []);
    }
    formData.append('moedaVO', moedaJsonBlob);

    if (idMoeda != undefined) {
        atualizarMoeda(formData);
    } else {
        cadastrarMoeda(formData);
    }
})









// Cadastrar moeda:
async function cadastrarMoeda(formData) {
    try {
        // Enviar a requisição para o servidor
        const response = await fetch('http://localhost:8080/Colecionador/rest/moeda/cadastrar', {
            method: "POST",
            body: formData
        });

        console.log('Resposta do servidor:', response);  // Verificando a resposta do servidor

        // Verificando se a resposta é OK (status 200-299)
        if (!response.ok) {
            alert('Erro ao cadastrar moeda');
            return;
        }

        // Verificar o tipo de conteúdo da resposta
        const contentType = response.headers.get("Content-Type");
        if (contentType && contentType.includes("application/json")) {
            const moedaVO = await response.json();  // Processa a resposta JSON

            // Se a moeda for cadastrada com sucesso, atualiza a lista de moedas
            alert("Cadastro concluído!");
            moeda = {};  // Limpa os dados da moeda
            form.reset();  // Reseta o formulário
            fileName.textContent = 'Nenhum arquivo selecionado';  // Limpa o nome do arquivo
            buscarMoedas(); // Atualiza a lista de moedas
        } else {
            alert('Resposta do servidor não contém JSON válido.');
        }
    } catch (error) {
        console.error('Erro ao cadastrar moeda:', error);
        alert('Erro ao cadastrar moeda. Verifique a conexão com o servidor ou os dados enviados.');
    }
}







// Atualizar moeda:
async function atualizarMoeda(formData) {
    let options = {
        method: "PUT",
        body: formData
    };

    const resultado = await fetch('http://localhost:8080/Colecionador/rest/moeda/atualizar', options);
    
    if (resultado.ok) {
        alert("Moeda atualizada");
        moeda = {};  // Limpa os dados da moeda
        form.reset();  // Reseta o formulário
        fileName.textContent = 'Nenhum arquivo selecionado';  // Limpa o nome do arquivo
        
        // Após atualizar, busque novamente as moedas para garantir que a tabela está atualizada
        buscarMoedas(); // Atualiza a lista de moedas
    } else {
        alert("Houve um problema na atualização da moeda");
    }
}





async function editarMoeda(dados) {
    console.log("Dados recebidos para edição:", dados);  // Verifique os dados recebidos

    // Atualizar o título para "Editar Moeda"
    const formTitle = document.querySelector('#form-title');
    if (formTitle) {
        formTitle.innerText = 'Editar Moeda';  // Muda o título do formulário
    } else {
        console.error('Elemento #form-title não encontrado');
    }

    // Verificar se a moedaVO existe antes de tentar acessar seus dados
    if (dados.moedaVO) {
        // Ler o conteúdo do arquivo JSON (moedaVO) que está em 'dados.moedaVO'
        const moedaJson = await dados.moedaVO.text(); // Lê o conteúdo do arquivo
        const moedaData = JSON.parse(moedaJson)[0]; // Supondo que a moeda seja um array, pegue o primeiro item

        // Preencher os campos do formulário com os dados da moeda
        moeda.idMoeda = dados.id;  // Usando 'id' de dados, já que você passou 'id' diretamente
        document.querySelector('#nome').value = moedaData.nome || '';  // Se não tiver nome, deixa em branco
        document.querySelector('#pais').value = moedaData.pais || '';
        document.querySelector('#ano').value = moedaData.ano || '';
        document.querySelector('#valor').value = moedaData.valor || '';
        document.querySelector('#detalhes').value = moedaData.detalhes || '';

        // Logar os valores preenchidos para verificação
        console.log("Dados no formulário após preenchimento:");
        console.log("Nome:", moedaData.nome);
        console.log("País:", moedaData.pais);
        console.log("Ano:", moedaData.ano);
        console.log("Valor:", moedaData.valor);
        console.log("Detalhes:", moedaData.detalhes);
    } else {
        console.error("moedaVO não encontrado nos dados recebidos");
    }

    // Exibir o formulário, caso esteja oculto
    const principal = document.querySelector('.principal');
    const exibir = document.querySelector('#mostrar');
    
    if (principal.style.display === 'none') {
        principal.style.display = 'flex';  // Exibe o formulário
        exibir.innerHTML = 'Ocultar';  // Atualiza o texto do botão para 'Ocultar'
    }
}












