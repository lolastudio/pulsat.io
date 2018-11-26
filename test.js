var Pulsatio = require('./index.js');
var ps = new Pulsatio({ mode: 'server' });
var pc = new Pulsatio({});

setInterval(() => {
    console.log(ps.getAllNodes());
}, 5000);