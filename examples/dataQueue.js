var Pulsatio = require('../index.js');

let pulsatio = new Pulsatio({
    mode: 'server'
});

for (let i = 0; i < 10; i++) {
    let mid = pulsatio.queue.add('1', { data: i }, () => {  // node_id, data
        console.log(new Date(), 'response', i);
    });
    // console.log(pulsatio.queue.remove('1', mid));
}