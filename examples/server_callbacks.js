var Pulsatio = require('../src/index.js');
var express = require('express');
var app = express();

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.listen(4200, function () {
    console.log('Example app listening on port 4200!');
});

var reload = function (data) {
    console.log('Loading previous db');
    return {
        '666': {
            id: 666,
            status: 'online'
        }
    }
}

var pulsatio = function (data) {
    console.log('\nJust tracking in my app:');
    console.log(data)
}

var registerNewNode = function (data) {
    console.log('\nIm gonna save to my db:');
    console.log(data)
}

var deregisterNode = function (data) {
    console.log('\nIm gonna close this node session:');
    console.log(data)   
}

var ps = new Pulsatio({
    mode: 'server',
    express: app,
    on: {
        connection: (info, next) => {
            console.log('new connection');
            next();
        }
    },
    callbacks: {
        reload: reload,
        pulsatio: pulsatio,
        registerNewNode: registerNewNode,
        deregisterNode: deregisterNode
    }
});

setInterval(() => {
    // console.log(ps.getAllNodes());
}, 5000);