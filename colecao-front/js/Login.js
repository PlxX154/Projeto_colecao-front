document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.querySelector('#formulario-usuario');

    formLogin.addEventListener('submit', async (evento) => {
        evento.preventDefault();

        const usuario = document.querySelector('.input-usuario').value.trim();
        const senha = document.querySelector('.input-senha').value.trim();

        if (!usuario || !senha) {
            mostrarErro('Por favor, preencha todos os campos.');
            return;
        }

        const options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ login: usuario, senha: senha }),
        };

        console.log('Enviando login:', { login: usuario, senha: senha });

        try {
            const response = await fetch("http://localhost:8080/Colecionador/rest/usuario/login", options);
            console.log('Resposta HTTP:', response);

            if (!response.ok) {
                const erroData = await response.json();
                console.log('Erro no servidor:', erroData);
                mostrarErro(erroData.message || 'Usuário ou senha incorretos.');
                return;
            }

            const usuarioVO = await response.json();
            console.log('Dados recebidos:', usuarioVO);

            if (!usuarioVO || !usuarioVO.idUsuario) {
                mostrarErro('Usuário inválido ou expirado.');
                return;
            }

            sessionStorage.setItem('idUsuario', usuarioVO.idUsuario);
            alert('Login bem-sucedido!');
            window.location.href = 'Homepage.html';
        } catch (error) {
            console.error('Erro no fetch:', error);
            mostrarErro('Erro ao tentar realizar o login. Tente novamente.');
        }
    });

    function mostrarErro(mensagem) {
        const erroContainer = document.querySelector('.erro-container');
        if (erroContainer) {
            erroContainer.textContent = mensagem;
            erroContainer.style.display = 'block';
        } else {
            alert(mensagem);
        }
    }
});
