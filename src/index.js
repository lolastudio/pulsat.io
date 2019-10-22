const request = require('request')
const uuidv4 = require('uuid/v4')
const os = require('os')

class Pulsatio {
    constructor(options = {}) {
        let defaults = {
            port: 4200,
            url: 'http://localhost:4200',
            interval: 30 * 1000,
            interval_timeout: 1.1,
            on: {},
            vpn: false,
            replication: null,
            replication_prefix: undefined
        }

        options = Object.assign(defaults, options)

        this.ENDPOINTS = {
            register: '/nodes',
            getAllNodes: '/nodes'
        }

        if (options.express) {
            this.express = options.express
        }

        this.nodes = {}
        this.options = options

        this.registerNewNode = this.registerNewNode.bind(this)
        this.pulsatio = this.pulsatio.bind(this)
        this.getNode = this.getNode.bind(this)
        this.getAllNodes = this.getAllNodes.bind(this)
        this.sendHeartbeat = this.sendHeartbeat.bind(this)
        this.connect = this.connect.bind(this)

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
        var bodyParser = require('body-parser')
        if (!this.express) {
            var express = require('express')
            this.express = express()
            this.express.use(bodyParser.json())
            this.express.listen(this.options.port, () => {
                this.log(`Pulsat.io @ ${this.options.port}`)
            })
        }
        else {
            this.express.use(bodyParser.json())
            this.log(`Pulsat.io started`)
        }

        this.initServerEndpoints()
    }

    initServerEndpoints() {
        this.express.put('/nodes/:id', this.pulsatio)
        this.express.get('/nodes/:id', this.getNode)
        this.express.post('/nodes/:id', this.registerNewNode)
        this.express.get(this.ENDPOINTS.getAllNodes, this.getAllNodes)
        this.express.post(this.ENDPOINTS.register, this.registerNewNode)
        this.express.delete('/nodes/:id', this.deregisterNode)
    }

    pulsatio(req, res) {
        let node = this.nodes[req.params.id]

        if (node) {
            clearTimeout(node.timeout)
            node.online = true
            node.lastHeartbeat = new Date()
            node.timeout = setTimeout(() => {
                node.online = false
            }, node.interval * this.options.interval_timeout)

            res.sendStatus(200)
            this.replicate(this.nodes[req.params.id], true)
        }
        else {
            res.sendStatus(404)
        }
    }

    getNode(req, res) {
        if (!res) {
            return this.clearNode(this.nodes[req])
        }
        else {
            res.send(this.clearNode(this.nodes[req.params.id]))
        }
    }

    getAllNodes(req, res) {
        if (!res) {
            return this.clearNode(this.nodes, true)
        }
        else {
            res.send(this.clearNode(this.nodes, true))
        }
    }

    registerNewNode(req, res) {
        let info = req.body
        info.online = true

        if (req.params.id) {
            info.id = req.params.id
        }

        if (info.replication_prefix) {
            info.id = `${info.replication_prefix}${info.id}`
        }

        if (info.id && this.nodes[info.id]) {
            for (let i in info) {
                this.nodes[info.id][i] = info[i]
            }

            return res.send(this.clearNode({
                pulsatio: { info: 'Updated', updated: true },
                ...this.nodes[info.id]
            }))
        }
        if (!info.id) {
            info.id = uuidv4()
        }

        info.registeredAt = new Date()
        info.lastHeartbeat = new Date()
        this.nodes[info.id] = Object.assign({}, info)
        this.nodes[info.id].timeout = setTimeout(() => {
            this.nodes[info.id].online = false
        }, this.nodes[info.id].interval * this.options.interval_timeout)

        if (this.options.on.connection) {
            this.options.on.connection(this.nodes[info.id], () => {
                res.send(this.clearNode(this.nodes[info.id]))
            })
        }
        else {
            res.send(this.clearNode(this.nodes[info.id]))
        }

        this.replicate(this.nodes[info.id])
    }

    deregisterNode(req, res) {
        if (!res) {
            this.nodes[req] = null
            delete this.nodes[req]
        }
        else {
            this.nodes[req.params.id] = null
            delete this.nodes[req.params.id]
        }
    }

    replicate(node, pulsatio) {
        if (this.options.replication) {
            if (!pulsatio) {
                this.connect(this.options.replication, node)
            }
            else {
                this.sendHeartbeat(this.options.replication, node)
            }
        }
    }

    initClient() {
        this.connect()
    }

    connect(base_url = this.options.url, node) {
        if (base_url) {
            let url = base_url + this.ENDPOINTS.register
            let data = node || {
                id: this.options.id,
                ip: ip(this.options.vpn),
                interval: this.options.interval,
                hostname: os.hostname(),
            }

            if (node) {
                data.replication_prefix = this.options.replication_prefix
            }

            request.post(url, { json: data }, (e, r, body) => {
                if (body && body.id) {
                    if (this.options.mode !== 'server') {
                        this.options.id = body.id

                        if (this.options.on.connection) {
                            this.options.on.connection(body)
                        }

                        this.sendHeartbeat()
                    }
                }
                else {
                    setTimeout(this.connect, this.options.interval)
                }
            })
        }
    }

    sendHeartbeat(base_url = this.options.url, node = this.options) {
        let url = base_url + `/nodes/${node.id}`
        let data = {
            ip: ip(this.options.vpn)
        }

        if (node) {
            data.replication_prefix = this.options.replication_prefix
            data.id = `${data.replication_prefix}${node.id}`
            url = base_url + `/nodes/${data.id}`
        }
        
        request.put(url, { json: data }, (e, r, body) => {
            if (this.options.mode !== 'server') {
                if (r && r.statusCode !== 404) {
                    this.disconnected = null
                    delete this.disconnected
                    this.timeout = setTimeout(this.sendHeartbeat, this.options.interval)
                }
                else {
                    this.disconnected = true
                    this.connect()
                }
            }
        })
    }

    clearNode(node, multiple) {
        if (node) {
            if (multiple === true) {
                let nodes = {}
                for (let n in node) {
                    let copy = Object.assign({}, node[n])
                    copy.timeout = null
                    delete copy.timeout
                    nodes[n] = copy
                }
                return nodes
            }
            else {
                let { timeout, ...ret } = node
                return ret
            }
        }
        else {
            if (multiple === true) { return {} }
            else {
                return undefined
            }
        }
    }

    log(...attrs) {
        if (this.options.verbose !== false) {
            console.log(attrs.join(', '))
        }
    }
}

function ip(prefervpn) {
    let interfaces = os.networkInterfaces()
    let results = []
    for (let devName in interfaces) {
        let iface = interfaces[devName]

        for (let i = 0; i < iface.length; i++) {
            let alias = iface[i]
            let last_digit = alias.address.substring(alias.address.length - 2, alias.address.length)
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal && last_digit !== '.1') {
                if (prefervpn) {
                    if (devName.split('tun').length > 1) {
                        return alias.address
                    }
                    else {
                        results.push(alias.address)
                    }
                }
                else {
                    return alias.address
                }
            }
        }
    }

    if (results.length > 0) {
        return results[0]
    }
    return '0.0.0.0'
}

module.exports = Pulsatio
