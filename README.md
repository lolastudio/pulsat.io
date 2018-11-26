# pulsat.io
Simple heartbeat server and client to manage overall objects
From latin, heartbeat

```
var Pulsatio = require('pulsat.io');
var ps = new Pulsatio({ mode: 'server' });
var pc = new Pulsatio({});

setInterval(() => {
    console.log(ps.getAllNodes());
}, 5000);
```
