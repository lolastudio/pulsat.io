var Pulsatio = require('../index.js');
var ps = new Pulsatio({ mode: 'server', on: {
    connection: (res, next) => {
        console.log('new connection');
        next();
    }
} });

setInterval(() => {
    // console.log(ps.getAllNodes());
}, 5000);