const request = require('request');
const uuidv4 = require('uuid/v4')

class Pulsatio {
    constructor(options = {}) {
        let defaults = {
            port: 4200,
            url: 'http://localhost:4200',
            interval: 30 * 1000
        }

        options = Object.assign(defaults, options)

        this.ENDPOINTS = {
            register: '/nodes',
            getAllNodes: '/nodes'
        }

        if (!options.express) {
            var express = require('express')
            this.express = express()
        }
        else {
            this.express = options.express
        }

        this.nodes = {}
        this.options = options

        this.registerNewNode = this.registerNewNode.bind(this);
        this.pulsatio = this.pulsatio.bind(this);

        this.init()
    }

    init() {
        if (this.options.mode === 'server') {
            this.initServer()
        }
        else {
            this.initClient()
        }
    }

    initServer() {
        let address
        if (this.express.address) {
            try {
                address = this.express.address()
            } catch (err) { }
        }

        var bodyParser = require('body-parser')
        this.express.use(bodyParser.json());

        if (!address) {
            this.express.listen(this.options.port, () => {
                this.log(`Pulsat.io @ ${this.options.port}`)
            })
        }

        this.initServerEndpoints()
    }

    initServerEndpoints() {
        this.express.put('/nodes/:id', this.pulsatio)
        this.express.get('/nodes/:id', this.getNode)
        this.express.get(this.ENDPOINTS.getAllNodes, this.getAllNodes)
        this.express.post(this.ENDPOINTS.register, this.registerNewNode)
        this.express.delete('/nodes/:id', this.deregisterNode)
    }

    pulsatio(req, res) {
        let node = this.nodes[req.params.id];
        clearTimeout(this.nodes[req.params.id].timeout);

        if (node) {
            this.nodes[req.params.id].lastHeartbeat = new Date();
        }

        this.nodes[req.params.id].timeout = setTimeout(() => {
            this.nodes[req.params.id].online = false;
        }, node.interval)

        res.sendStatus(200);
    }

    getNode() {

    }

    getAllNodes() {
        return this.nodes;
    }

    registerNewNode(req, res) {
        let info = req.body;
        info.online = true;
        if (info.id && this.nodes[info.id]) {
            res.send({ info: 'Already registered!' });
            return;
        }
        if (!info.id) {
            info.createdAt = new Date();
            info.lastHeartbeat = new Date();
            info.id = uuidv4();
            this.nodes[info.id] = Object.assign({}, info);
            res.send(info);
        }
    }

    deregisterNode() {

    }

    initClient() {
        this.connect();
    }

    async connect() {
        if (this.options.url) {
            let url = this.options.url + this.ENDPOINTS.register
            let data = {
                id: this.options.id,
                ip: ip(),
                interval: this.options.interval
            }

            request.post(url, { json: data }, (e, r, body) => {
                this.options.id = body.id;
                this.startHeartbeat();
            });
        }
    }

    startHeartbeat() {
        this.interval = setInterval(() => {
            let url = this.options.url + `/nodes/${this.options.id}`
            let data = {
                ip: ip()
            }

            request.put(url, { json: data }, (e, r, body) => {
                this.startHeartbeat();
            });
        }, this.options.interval)
    }

    log(...attrs) {
        if (this.options.verbose !== false) {
            console.log(attrs.join(', '))
        }
    }
}

function ip() {
    let interfaces = require('os').networkInterfaces();
    for (let devName in interfaces) {
        let iface = interfaces[devName];

        for (let i = 0; i < iface.length; i++) {
            let alias = iface[i];
            let last_digit = alias.address.substring(alias.address.length - 2, alias.address.length);
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal && last_digit !== '.1') {
                return alias.address;
            }
        }
    }

    return '0.0.0.0';
}

module.exports = Pulsatio