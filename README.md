# pulsat.io
From latin, pulsatio means heartbeat / beating / pulse

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

### options 
- server

| Option  | Type | Required | Default |
| ------------- | ------------- | ------------- | ------------- |
| port  | integer  | Optional | 4200 |
| express | express instance  | Optional | express new instance |
| interval_timeout | float  | Optional | 1.1 |


- client

| Option  | Type | Required | Default |
| ------------- | ------------- | ------------- | ------------- |
| url  | string  | Optional | 'http://localhost:4200' |
| interval | integer | Optional | 30000 |

### endpoints

| Endpoint | Type |
| ------------- | ------------- |
| /nodes/:id | PUT |
| /nodes/:id | GET |
| /nodes | GET |
| /nodes | POST |
| /nodes/:id | DELETE |
