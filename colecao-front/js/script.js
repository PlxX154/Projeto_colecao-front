const form = document.querySelector('#formulario'); 
const limpar = document.querySelector('#limpar');
const exibir = document.querySelector('#exibir'); 
//const principal document.querySelector('.principal');
//const inputFile document.getElementById('arquivo'); 
const fileName = document.getEleslentById('nome-arquivo');

let pessoa = {};

inputFile.addEventListener('change', function() {
    if (inputFile.files.length > 0) {
        fileName.textContent = inputFile.files[0].name;
    } else {
        fileName.textContent = 'Nenhum arquivo selecionado';
    }
});

exibir.addEventListener("click", function(){
    if(principal.style.display === 'flex'){
        principal.style.display= 'none';
        exibir.innerHTML = 'Exibir';
        } else {
        principal.style.display = 'flex';
        exibir.innerHTML = 'Ocultar';
        }
});

function formatarDataPadraoBrasil (data) {
    let dataFormatada = new Date(data),
    dia = dataFormatada.getDate().toString().padStart(2, '0'),
    mes = (dataFormatada.getMonth()+1).toString().padStart(2, '0'),
    ano = dataFormatada.getFullYear();
    return dia+"/"+mes+"/"+ano;
};

function formatarDataPadraoAmericano(data) {
    let dataFormatada = new Date(data),
    dia = dataFormatada.getDate().toString().padStart(2, '0'), 
    mes = (dataFormatada.getMonth()+1).toString().padStart(2, '0'),
    ano = dataFormatada.getFullYear();
    return ano+"-"+mes+"-"+dia;
};

limpar.addEventListener('click', (evento) => {
    evento.preventDefault();
    pessoa = {};
    form.reset();
    fileName.textContent = 'Nenhum arquivo selecionado';
});

async function buscarPessoas () {
    let listaPessoas = {};
    let options = {
        method: "GET"
    };
    const response = await fetch('http://localhost:8080/pessoa/rest/pessoa/listar', options);
    // Verifica se o status da resposta é 204 (No Content)
    if (response.status === 204) {
        alert("Nenhuma pessoa encontrada.");
        return ''; // Encerra a função, já que não há conteúdo a ser processado
    }
    const formData = await response.formData();

    // Objeto temporário para agrupar pessoas e imagens
    const pessoasMap = {};
    for (let [key, value] of formData. entries()) {
        const [pessoaId, type] = value.name.split('-');
        if (!pessoasMap [pessoaId]) {
            pessoasMap[pessoaId] = { id: pessoaId };
        }
        if (type === 'pessoa.json') {
            // Supondo que o JSON esteja em um arquivo
            pessoasMap [pessoaId]. pessoaVO = value;
        } else if (type  === 'imagem.jpg') {
            // Supondo que a imagem esteja em um arquivo
            pessoasMap [pessoaId]. imagem = value;
        }
    }
    // Converte o objeto para um array de pessoas 
    listaPessoas = Object.values (pessoasMap);
    if(listaPessoas.length != 0) {
        preencherTabela (listaPessoas);
    } else {
        alert("Houve um problema na montagem do array de pessoas.");
    }
}
buscarPessoas();

async function preencherTabela(listaPessoas) {
    let tbody = document.getElementById('tbody'); 
    tbody.innerText='';
    
    for (let pessoa of listaPessoas){
        let tr = tbody.insertRow();
        let td_idPessoa = tr.insertCell(); 
        let td_imagen = tr.insertCell(); 
        let td_nome = tr.insertCell();
        let td_cpf = tr.insertCell();
        let td_dataNascimento = tr.insertCell();
        let td_acoes = tr.insertCell();

        if(pessoa.imagem) {
            const imgUrl = URL.createObjectURL(pessoa. imagen); 
            const img = document.createElement('img');
            img.src = imgUrl;
            ing.style.width = '80px';
            td_imagen.appendChild(img);
        }
        if (pessoa.pessoaVO) {
            const pessoaJson = await pessoa.pessoaVO.text();
            pessoa = JSON.parse(pessoaJson);
            td_idPessoa.innerText = pessoa.idPessoa;
            td_nome.innerText = pessoa.nome;
            td_cpf.innerText = pessoa.cpf;
            td_dataNascimento.innerText = formatarDataPadraoBrasil (pessoa.dataNascimento);
        }

        let editar = document.createElement('button');
        editar.textContent = 'Editar';
        editar.style.height = '30px';
        editar.style.width = '100px';
        editar.style.margin ='5px';
        editar.style.padding = '2px';
        editar.style.background = '#9e9e9e';
        editar.style.border = 'none';
        editar.style.borderRadius = '5px';
        editar.style.cursor = 'pointer';
        editar.setAttribute('onclick', 'editarPessoa('+JSON.stringify(pessoa)+')');
        td_acoes.appendChild(editar);
    
        let excluir = document.createElement('button');
        excluir.textContent = 'Excluir';
        excluir.style.height = '30px';
        excluir.style.width = '100px';
        excluir.style.margin ='5px';
        excluir.style.padding = '2px';
        excluir.style.background = '#9e9e9e';
        excluir.style.border = 'none';
        excluir.style.borderRadius = '5px';
        excluir.style.cursor = 'pointer';
        excluir.setAttribute('onclick', 'escluirPessoa('+JSON.stringify(pessoa)+')');
        td_acoes.appendChild(excluir);
    
    }
}

async function excluirPessoa(dados) {
    let options = {
        method: "DELETE",
        headers: {"Content-type": "application/json"},
        body: JSON.stringify({
            idPessoa: dados.idPessoa,
            nome: dados.nome,
            cpf: dados.cpf,
            dataNascimento: dados.dataNascimento
        })
    };
    const resultado = await fetch('http://localhost:8080/pessoa/rest/pessoa/excluir', options); 
    if (resultado.ok == true) {
        alert("Exclusão realizada com sucesso.");
        pessoa = {};
        buscarPessoas ();
    } else {
        alert("Houve um problema na exclusão da pessoa.");
    }
}