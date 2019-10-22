var Pulsatio = require('../src/index.js');
var express = require('express');
var app = express();

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.listen(4200, function () {
    console.log('Example app listening on port 4200!');
});

var ps = new Pulsatio({
    mode: 'server',
    express: app,
    on: {
        connection: (info, next) => {
            info.a = 'b'
            console.log('new connection');
            next();
        }
    }
});

setInterval(() => {
    // console.log(ps.getAllNodes());
}, 5000);