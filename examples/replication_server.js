var Pulsatio = require('../index.js');

var ps = new Pulsatio({
    mode: 'server',
    port: 9999,
    on: {
        connection: (info, next) => {
            next();
        }
    }
});