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
    replication: 'http://localhost:9999',
    on: {
        connection: (info, next) => {
            info.replication_prefix = '78-'
            info.a = 'b'
            next();
        }
    }
});

setInterval(() => {
    // console.log(ps.getAllNodes());
}, 5000);