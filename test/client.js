var Pulsatio = require('../index.js');
var pc = new Pulsatio({
    id: 'imx7-1',
    interval: 5000,
    on: {
        connection: (data) => {
            console.log(data);
        }
    }
});