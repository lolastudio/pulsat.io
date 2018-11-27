var Pulsatio = require('./index.js');
var ps = new Pulsatio({ mode: 'server' });
var pc = new Pulsatio({ id: 'imx7-1' });

setTimeout(() => {
    console.log(ps.getNode('imx7-1'));
    // console.log(ps.getAllNodes());
}, 5000);