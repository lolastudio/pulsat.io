var Pulsatio = require('../src/index.js');
var pc = new Pulsatio({
    id: 'imx7-1',
    interval: 5000,
    on: {
        connection: (data) => {
            console.log(data);

            setTimeout(() => {
                new Pulsatio({
                    id: 'imx7-1',
                    interval: 15000,
                    new: true,
                    on: {
                        connection: (data) => { console.log('node updated'); }
                    }
                });
            }, 15e3);
        }
    }
});