var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use('/static', express.static(__dirname + '/static'));

app.set('view engine', 'html');

require('nunjucks').configure('views', {
    autoescape: true,
    express: app,
    watch: true
});

app.get('/', function (req, res) {
    res.render('chat');
});

var users = [];
var timmer = null;

io.on('connection', function (socket) {

    io.emit('refresh user', users);
    socket.join('room');
    socket.on('current user', function (req) {
        socket.user = req;
        if( users.indexOf(req) > -1 ) {
            clearTimeout(timmer);
        } else {
            socket.emit('is login', false);
        }
    });

    //  添加连接用户
    socket.on('create', function (req) {
        users.push(req);
        io.emit('refresh user', users);
        socket.broadcast.emit('sys', req);
    });

    socket.on('client', function (req) {
        socket.emit('iSay', {name:socket.user, message: req});
        socket.broadcast.to('room').emit('otherSay', {name:socket.user, message: req});
    });


    socket.on('disconnect', function (a) {
        if( users.indexOf(socket.user) > -1 ) {
            timmer = setTimeout(function () {
                users.splice(users.indexOf(socket.user), 1);
                io.emit('logout', socket.user);
                io.emit('refresh user', users);
            }, 3000);
        }
    });
});


server.listen(80, function () {
    console.log('----------------- Server is running -----------------')
});
