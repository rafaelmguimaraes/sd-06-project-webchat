const app = require('express')();
const http = require('http').createServer(app);
const cors = require('cors');
const io = require('socket.io')(http, {
  cors: {
    origin: 'http://localhost:3000', // url aceita pelo cors
    methods: ['GET', 'POST'], // Métodos aceitos pela url
  },
});

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(cors());

app.get('/', (req, res) => {
  res.status(200).render('template');
});

let onlineUsers = [];
io.on('connection', (socket) => {
  console.log(`Conectado: ${socket.id}`);
  const newUserId = socket.id.slice(0, 16);
  console.log(`newUserId: ${newUserId}`);
  onlineUsers.push(newUserId);
  socket.emit('whoAmI', newUserId);
  socket.emit('onlineUsers', onlineUsers);
  socket.broadcast.emit('onlineUsers', onlineUsers);
  // socket.broadcast.emit('mensagemServer', { mensagem: `Iiiiiirraaaa! Fulano${fulano} acabou de se conectar :D` });
  
  /* socket.on('send-nickname', (socket) => {
    console.log(socket);
    users.push(socket);
    console.log(users);
  }); */

  socket.on('disconnect', () => {
    console.log(`Desconectado: ${socket.id}`);
    onlineUsers = onlineUsers.filter((user) => user !== newUserId);
    socket.broadcast.emit('onlineUsers', onlineUsers);
  });

  socket.on('message', (msg) => {
    io.emit('messageServer', { message: msg });
  });
});

http.listen(3000, () => {
  console.log('Servidor ouvindo na porta 3000');
});