document.addEventListener('DOMContentLoaded', () => {
    // Início do listener 'DOMContentLoaded'
    const socket = io("https://meu-chat-socketio.onrender.com");

    // Variáveis da tela de login
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username-input');

    // Variáveis do chat
    const chatContainer = document.getElementById('chat-container');
    const form = document.getElementById('form');
    const input = document.getElementById('input');
    const messages = document.getElementById('messages');
    const usersList = document.getElementById('users');

    let username = '';

    // Início do listener de login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        username = usernameInput.value;
        if (username) {
            socket.emit('login', username);
            loginForm.style.display = 'none';
            chatContainer.style.display = 'block';
        }
    }); // Fim do listener de login

    // Início do listener de envio de mensagem
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (input.value) {
            const messageText = input.value;
            
            if (messageText.startsWith('/w ')) {
                const parts = messageText.split(' ');
                const recipient = parts[1];
                const privateMsg = parts.slice(2).join(' ');

                if (recipient && privateMsg) {
                    socket.emit('chat message', {
                        user: username,
                        msg: privateMsg,
                        recipient: recipient
                    });
                } else {
                    const item = document.createElement('li');
                    item.textContent = `Erro: Use o formato '/w [nome_do_usuário] [mensagem]'`;
                    item.style.color = 'red';
                    messages.appendChild(item);
                }
            } else {
                socket.emit('chat message', {
                    user: username,
                    msg: messageText
                });
            }
            input.value = '';
        }
    }); // Fim do listener de envio de mensagem

    // Início dos eventos do Socket.IO
    socket.on('chat message', (data) => {
        const item = document.createElement('li');
        item.textContent = `${data.user}: ${data.msg}`;
        messages.appendChild(item);
        window.scrollTo(0, document.body.scrollHeight);
    });

    socket.on('update users list', (users) => {
        usersList.innerHTML = '';
        users.forEach(user => {
            const item = document.createElement('li');
            item.textContent = user;
            usersList.appendChild(item);
        });
    });
    
    socket.on('login error', (message) => {
        alert(message);
    }); // Fim dos eventos do Socket.IO

}); // Fim do listener 'DOMContentLoaded'
