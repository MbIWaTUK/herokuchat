var express = require('express');
var app = express();
var logger = require('log4js').getLogger();
var server = app.listen(process.env.PORT);
var io = require('socket.io')(server);
var port = process.env.PORT || 8000;



app.use(express.static(__dirname+'/'));

app.get('/socket.io.js', function(req,res){
    res.sendFile(__dirname+'/node_modules/socket.io-client/dist/socket.io.js');
});

app.get('/jquery.js', function(req,res){
    res.sendFile(__dirname+'/node_modules/jquery/dist/jquery.min.js');
});

app.get('/uikit.js', function(req,res){
    res.sendFile(__dirname+'/uikit/dist/js/uikit.min.js');
});

app.get('/uikit.css', function(req,res){
    res.sendFile(__dirname+'/uikit/dist/css/uikit.almost-flat.min.css');
});

app.get('/animate.css', function(req,res){
    res.sendFile(__dirname+'/node_modules/animate.css/animate.min.css');
});

app.get('/style.css', function(req,res){
    res.sendFile(__dirname+'/style.css');
});

app.get('/main.js', function(req,res){
    res.sendFile(__dirname+'/main.js');
});
function usersCountToLog(){
    logger.info('User count: '+io.engine.clientsCount);
}

io.on('connection', function(socket){

    function setName(name){
        if(name != undefined && name != ''){
            socket.session = {};
            socket.session.userName = name;
            socket.session.address = socket.handshake.address;
            socket.session.id = socket.id;

            socket.broadcast.emit('newUser', socket.session);
            socket.emit('userName', socket.session);


            socket.emit('userList', io.length);

            logger.info('User '+socket.session.userName+' join from IP: '+socket.session.address);
            usersCountToLog();
            var clients = io.sockets.connected;


            var clientsList = {}
            for(var key in clients){
                if(clients[key].session)
                    clientsList[key] = clients[key].session;
            }

            socket.emit('clientsList', clientsList);
            console.log(clientsList);
        }

        else
            socket.emit('setName');
    };
    setName(null);
    socket.on('setName', function(name){
        if(name.length > 0)
            setName(name);
        else
            socket.emit('setName');
    });

    socket.on('message', function(msg){
        if(socket.session){
            if(socket.session.userName === null || socket.session.userName == '' || socket.session.userName == undefined){
                socket.emit('setName');
            }else{
                logger.trace('-----------');
                logger.trace('User: ' + socket.session.userName + ' | Message: ' + msg);
                logger.trace('====> Sending message to other chaters...');

                socket.broadcast.emit('messageFromClients', msg, socket.session.userName);
                socket.emit('messageToClients', msg, socket.session.userName);
            }
        }
    });

    socket.on('disconnect', function(){
        if(socket.session){
            io.sockets.emit('userDisconnected', socket.session);
            logger.info('User '+socket.session.userName+' left chat');
            usersCountToLog();
        }
    });
});
