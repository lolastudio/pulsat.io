var Pulsatio = require('../index.js');

let pulsatio = new Pulsatio({
    mode: 'server'
});

for (let i = 0; i < 10; i++) {
    pulsatio.queue.add('1', { data: i }, () => {  // node_id, data
        console.log(new Date(), 'response', i);
    });
}