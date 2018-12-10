var Pulsatio = require('../index.js');
var ps = new Pulsatio({ mode: 'server' });

setInterval(() => {
    console.log(ps.getAllNodes());
}, 5000);