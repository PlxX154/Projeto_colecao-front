const principal = document.querySelector('.principal');
const secundario = document.querySelector('.secundario');
const limpar = document.querySelector('#limpar');
const mostrar = document.querySelector('#mostrar');
const inputFile = document.getElementById('arquivo');
const fileName = document.getElementById('nome-arquivo');
const cadastro = document.getElementById('#cadastro');
const form = document.querySelector('#formulario-usuario');


let usuario = {};  // Objeto que armazena os dados do usuário.


async function preencherTabela(listausuario) {
    let tbody = document.getElementById('tbody');
    tbody.innerText = ''; // Limpar o conteúdo da tabela

    for (let usuario of listausuario) {
        let tr = tbody.insertRow();
        let td_idUsuario = tr.insertCell();
        let td_nome = tr.insertCell();
        let td_email = tr.insertCell();
        let td_login = tr.insertCell();
        let td_senha = tr.insertCell();
        let td_acoes = tr.insertCell(); // Adiciona a célula para as ações (editar, excluir)

        if (usuario.usuarioVO) {
            const usuarioJson = await usuario.usuarioVO.text();
            const usuarioData = JSON.parse(usuarioJson);

            td_idUsuario.innerText = usuarioData.idUsuario;
            td_nome.innerText = usuarioData.nome;
            td_email.innerText = usuarioData.email;
            td_login.innerText = usuarioData.login;
            td_senha.innerText = usuarioData.senha;

            // Verifique os dados antes de passar para a exclusão
            console.log('Dados do usuário para exclusão:', usuarioData); // Adicione este log de depuração

            // Criar os botões de ação para edição e exclusão
            let editar = document.createElement('button');
            editar.textContent = 'Editar';
            editar.style.height = '30px';
            editar.style.width = '100px';
            editar.style.margin = '5px';
            editar.style.padding = '2px';
            editar.style.background = '#C6C6C6';
            editar.style.border = 'none';
            editar.style.borderRadius = '5px';
            editar.style.cursor = 'pointer';
            editar.addEventListener('click', () => editarUsuario(usuarioData));
            td_acoes.appendChild(editar);

            let excluir = document.createElement('button');
            excluir.textContent = 'Excluir';
            excluir.style.height = '30px';
            excluir.style.width = '100px';
            excluir.style.margin = '5px';
            excluir.style.padding = '2px';
            excluir.style.background = '#C6C6C6';
            excluir.style.border = 'none';
            excluir.style.borderRadius = '5px';
            excluir.style.cursor = 'pointer';

            // Usando addEventListener para passar o objeto `usuarioData` corretamente
            excluir.addEventListener('click', () => excluirUsuario(usuarioData));

            td_acoes.appendChild(excluir);
        }
    }
}

async function excluirUsuario(usuarioData) {
    const idUsuarioLogado = sessionStorage.getItem('idUsuario');
    
    // Verifique se o idUsuarioLogado existe
    if (!idUsuarioLogado) {
        alert('Usuário não logado');
        return;
    }

    console.log('Excluindo o usuário com id:', idUsuarioLogado);  // Verificando qual id está sendo enviado

    let options = {
        method: "DELETE",  // Excluindo logicamente
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({
            idUsuario: idUsuarioLogado, // Usando o id do usuário logado
        })
    };

    try {
        const resultado = await fetch('http://localhost:8080/Colecionador/rest/usuario/excluir', options);
        
        // Verificando o status da resposta
        console.log('Status da resposta:', resultado.status);  // Verifique o status da resposta

        if (resultado.ok) {
            const resposta = await resultado.json();  // Parseando o corpo da resposta
            console.log('Resposta do servidor:', resposta);  // Verificando a resposta retornada
            if (resposta.value) {
                alert("Usuário excluído com sucesso.");
                window.location.href = 'Login.html';  // Redireciona após a exclusão
            } else {
                alert("Houve um erro ao excluir o usuário.");
            }
        } else {
            alert("Houve um erro ao excluir o usuário.");
        }
    } catch (error) {
        console.error("Erro na requisição de exclusão:", error);
        alert('Erro na exclusão, tente novamente.');
    }
}






document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#formulario-usuario');

    if (form) {
        form.addEventListener('submit', async (evento) => {
            evento.preventDefault();

            const nome = document.getElementById('nome').value;
            const email = document.getElementById('email').value;
            const login = document.getElementById('login').value;
            const senha = document.getElementById('senha').value;

            // Recuperar o ID do usuário logado armazenado no sessionStorage
            const idUsuarioLogado = sessionStorage.getItem('idUsuario');
            
            // Verificar se o ID do usuário logado existe
            if (!idUsuarioLogado) {
                console.error("Usuário não está logado! Não é possível atualizar.");
                return;
            }

            // Criar o objeto usuarioVO com os dados do formulário
            const usuarioVO = {
                idUsuario: idUsuarioLogado,  // Usar o ID do usuário logado
                nome: nome,
                email: email,
                login: login,
                senha: senha,
            };

            // Agora, enviar os dados como JSON diretamente
            await atualizarUsuario(usuarioVO);
        });
    } else {
        console.error("Formulário não encontrado!");
    }
});








async function cadastrarUsuario(formData) {
    const options = {
        method: "POST",
        body: formData
    };

    try {
        const response = await fetch('http://localhost:8080/Colecionador/rest/usuario/cadastrar', options);
        const result = await response.json();

        if (result.idUsuario !== 0) {
            alert("Cadastro realizado com sucesso!");
            usuario = {};  // Resetar a variável usuário.
            form.reset();  // Limpar o formulário.
            fileName.textContent = 'Nenhum arquivo foi encontrado';
        }
    } catch (error) {
        alert("Erro ao cadastrar usuário.");
        console.error(error);
    }
}

async function atualizarUsuario(usuarioVO) {
    const options = {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(usuarioVO)
    };

    try {
        const response = await fetch('http://localhost:8080/Colecionador/rest/usuario/atualizar', options);
        if (response.ok) {
            alert("Usuário atualizado com sucesso!");

            // Atualiza a tabela com a lista de usuários (pode ser necessário buscar a lista novamente)
            const usuarios = await response.json(); // Isso depende do formato da resposta
            preencherTabela(usuarios);  // Atualiza a tabela com os usuários

            // Limpar os campos do formulário
            const form = document.querySelector('#formulario-usuario');
            form.reset();  // Limpa todos os campos do formulário

        } else {
            alert("Erro ao atualizar usuário.");
        }
    } catch (error) {
        console.error("Erro ao atualizar:", error);
    }
}



