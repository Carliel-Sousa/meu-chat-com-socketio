const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Define a pasta 'public' como a pasta de arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'teste.html'));
});

// Lógica de conexão e mensagens do chat
const users = {}; // Objeto para armazenar usuários online

io.on('connection', (socket) => {
    console.log('Um usuário conectou-se!');

    socket.on('login', (username) => {
        socket.username = username;
        users[socket.id] = username; // Adiciona o usuário ao objeto
        console.log(`Usuário ${username} entrou no chat`);
        io.emit('chat message', { user: 'Sistema', msg: `${username} entrou no chat.` });
        io.emit('update users list', Object.values(users)); // Envia a lista atualizada
    });

    socket.on('chat message', (data) => {
        if (data.recipient) {
            // Se houver um destinatário, é uma mensagem privada
            const recipientSocketId = Object.keys(users).find(key => users[key] === data.recipient);
            if (recipientSocketId) {
                // Envia a mensagem para o destinatário
                io.to(recipientSocketId).emit('chat message', { user: data.user, msg: `(privado): ${data.msg}` });
                // Envia uma cópia para o remetente para que ele veja a mensagem que enviou
                io.to(socket.id).emit('chat message', { user: data.user, msg: `(para ${data.recipient}): ${data.msg}` });
            }
        } else {
            io.emit('chat message', { user: data.user, msg: data.msg });
        }
    });

    socket.on('disconnect', () => {
        if (socket.username) {
            delete users[socket.id]; // Remove o usuário do objeto
            console.log(`Usuário ${socket.username} desconectou-se.`);
            io.emit('chat message', { user: 'Sistema', msg: `${socket.username} saiu do chat.` });
            io.emit('update users list', Object.values(users)); // Envia a lista atualizada
        }
    });
});

// AQUI ESTÁ A PARTE QUE ESTAVA FALTANDO E QUE CAUSAVA TODOS OS ERROS
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}.`);
});