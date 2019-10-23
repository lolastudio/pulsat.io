<img src="https://github.com/roquef/pulsat.io/blob/master/pulsat.io.png?raw=true"></img>

> From latin, pulsatio means heartbeat / beating / pulse

Simple heartbeat server and client to manage overall agents and discovery, supports automatic replication and it can also be used with your existing express instance

### quick-start
- install
```
npm install pulsat.io
```

- server
```
const Pulsatio = require('pulsat.io');
const ps = new Pulsatio({ mode: 'server' });
```

- client 
```
const Pulsatio = require('pulsat.io');
const pc = new Pulsatio();
```

### middlewares
- on connection (server)
```
new Pulsatio({
    mode: 'server',
    on: {
        connection: (node, next) => {
            console.log('new connection')
            node.a = 'b'
            next()
        }
    }
});
```

### listeners
- on connection (client)
```
new Pulsatio({
    on: {
        connection: (data) => {
            console.log(data)
        }
    }
})
```

### options 
- server

| Option  | Type | Required | Default |
| ------------- | ------------- | ------------- | ------------- |
| port  | integer  | Optional | 4200 |
| express | express instance  | Optional | express new instance |
| interval_timeout | float  | Optional | 1.1 |
| vpn | boolean  | Optional | false |
| replication | string | Optional | null |
| replication_prefix | string | Optional | '' |

- client

| Option  | Type | Required | Default |
| ------------- | ------------- | ------------- | ------------- |
| url  | string  | Optional | 'http://localhost:4200' |
| id  | string  | Optional | generated uuid |
| interval | integer | Optional | 30000 |


### endpoints

| Endpoint | Type |
| ------------- | ------------- |
| /nodes/:id | GET, POST, PUT, DELETE |
| /nodes | GET, POST |

### other clients
- [browser client](https://github.com/roquef/pulsat.io-js)
