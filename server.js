const app = require('express')();
const http = require('http').createServer(app);
const cors = require('cors');
const io = require('socket.io')(http, {
  cors: {
    origin: 'http://localhost:3000', // url aceita pelo cors
    methods: ['GET', 'POST'], // Métodos aceitos pela url
  },
});
const moment = require('moment');

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(cors());

app.get('/', (req, res) => {
  res.status(200).render('template');
});

let onlineUsers = [];
io.on('connection', (socket) => {
  const newUserId = socket.id.slice(0, 16);
  onlineUsers.push(newUserId);
  socket.emit('whoAmI', newUserId);
  socket.emit('onlineUsers', onlineUsers);
  socket.broadcast.emit('onlineUsers', onlineUsers);

  socket.on('disconnect', () => {
    onlineUsers = onlineUsers.filter((user) => user !== newUserId);
    socket.broadcast.emit('onlineUsers', onlineUsers);
  });

  socket.on('message', ({ chatMessage, nickname }) => {
    io.emit('message', `${moment().format('DD-MM-YYYY HH:mm:ss')} - ${nickname}: ${chatMessage}`);
  });

  socket.on('setNickname', (nickName) => {
    io.emit('whoAmI', nickName);
    io.emit('onlineUsers', onlineUsers);
  });
});

http.listen(3000, () => {
  console.log('Servidor ouvindo na porta 3000');
});