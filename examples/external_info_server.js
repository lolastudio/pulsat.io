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
    register_put: true,
    on: {
        connection: (info, next) => {
            console.log('new connection');
            console.log(ps.clearNode(info));
            next();
        }
    },
}, 
{
    '1': {
        ip: '192.168.0.100',
        id: '1',
        info: 'Externally saved node info'
    },
    '2': {
        ip: '192.168.0.200',
        id: '2',
        info: 'Externally saved node info'
    }
});

setInterval(() => {
    // console.log(ps.getAllNodes());
}, 5000);