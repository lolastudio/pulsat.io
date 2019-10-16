<img src="https://github.com/roquef/pulsat.io/blob/master/pulsat.io.png?raw=true"></img>

From latin, pulsatio means heartbeat / beating / pulse

[![install size](https://packagephobia.now.sh/badge?p=pulsat.io)](https://packagephobia.now.sh/result?p=pulsat.io)


Simple heartbeat server and client to manage overall agents and discovery, it can also be used with your existing express instance

```
npm install pulsat.io
```

- server
```
var Pulsatio = require('pulsat.io');
var ps = new Pulsatio({ mode: 'server' });
```

- client 
```
var Pulsatio = require('pulsat.io');
var pc = new Pulsatio();
```

### middlewares
- on connection (server)
```
new Pulsatio({
    mode: 'server',
    on: {
        connection: (info, next) => {
            console.log('new connection')
            info.a = 'b'
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

- client

| Option  | Type | Required | Default |
| ------------- | ------------- | ------------- | ------------- |
| url  | string  | Optional | 'http://localhost:4200' |
| id  | string  | Optional | generated uuid |
| interval | integer | Optional | 30000 |


### endpoints

| Endpoint | Type |
| ------------- | ------------- |
| /nodes/:id | GET |
| /nodes/:id | POST |
| /nodes/:id | PUT |
| /nodes/:id | DELETE |
| /nodes | GET |
| /nodes | POST |

### other clients
- [browser client](https://github.com/roquef/pulsat.io-js)
