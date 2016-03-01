var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var interval = process.env.TIME_INTERVAL || 5000;
var history = [];


function rand(max){
    return Math.random()*max;
}

function randData(){
    return {
        download: rand(100),
        upload: rand(80),
        ping: rand(300),
        date: Date.now()
    };
}


io.on('connect', function (socket) {
    var data = randData();
    io.emit('client:display', data);
});

setInterval(function () {
    var result = randData();

    history.push(result);
    io.emit('client:update', result);
}, interval);

app.use('/', express.static('client'));
app.use('/', express.static('node_modules/d3'));

http.listen(port, function () {
    console.log('Running our app at http://localhost:'+port)
});