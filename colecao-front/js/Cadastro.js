
    const form = document.querySelector('#form');

    form.addEventListener('submit', async (evento) => {
        evento.preventDefault();

        // Adicione os logs para verificar se os elementos estão sendo encontrados
        console.log(document.querySelector('.input-nome')); // Verifica se o elemento existe
        console.log(document.querySelector('.input-email'));
        console.log(document.querySelector('.input-usuario'));
        console.log(document.querySelector('.input-senha'));

        // Recupera os valores dos campos
        const nome = document.querySelector('.input-nome').value;
        const email = document.querySelector('.input-email').value;
        const usuario = document.querySelector('.input-usuario').value;
        const senha = document.querySelector('.input-senha').value;

        let options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"},
            
            body: JSON.stringify({
                nome: nome,
                email: email,
                login: usuario,
                senha: senha
            })
        };

        try {
            const response = await fetch("http://localhost:8080/Colecionador/rest/usuario/cadastrar", options);
            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.statusText}`);
            }
            const usuarioVO = await response.json();

            if (usuarioVO.idUsuario > 0) {
                window.alert('Cadastro realizado com sucesso.');
                window.location.href = 'Login.html';
            } else {
                mostrarErro('Login ou e-mail já cadastrados no sistema.');
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            mostrarErro('Ocorreu um erro ao processar a requisição.');
        }
    });
;
