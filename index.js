const app = require('http').createServer();
const io = require('socket.io')(app);

app.listen(3000);

io.on('connection', socket => {

	socket.emit('message', {
		data: 'Hola mundo'
	});

});