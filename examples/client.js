var Pulsatio = require('../index.js');
var pc = new Pulsatio({
    id: '1',
    interval: 5000,
    url: 'http://localhost:4200',
    on: {
        connection: (data) => {
            console.log(data);
        }
    }
});