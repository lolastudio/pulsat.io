var Pulsatio = require('../index.js');
new Pulsatio({
    id: '1',
    interval: 5000,
    url: 'http://localhost:4200',
    on: {
        connection: (data) => {
            console.log('Connected');
        },
        heartbeat: (info) => {
            console.log(new Date(), info.data);
        }
    }
});

