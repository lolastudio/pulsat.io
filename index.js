'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var request = require('request');
var uuidv4 = require('uuid/v4');
var os = require('os');

var Pulsatio = function () {
    function Pulsatio() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, Pulsatio);

        var defaults = {
            port: 4200,
            url: 'http://localhost:4200',
            interval: 30 * 1000,
            interval_timeout: 1.1,
            on: {}
        };

        options = Object.assign(defaults, options);

        this.ENDPOINTS = {
            register: '/nodes',
            getAllNodes: '/nodes'
        };

        if (!options.express) {
            var express = require('express');
            this.express = express();
        } else {
            this.express = options.express;
        }

        this.nodes = {};
        this.options = options;

        this.registerNewNode = this.registerNewNode.bind(this);
        this.pulsatio = this.pulsatio.bind(this);
        this.getNode = this.getNode.bind(this);
        this.getAllNodes = this.getAllNodes.bind(this);
        this.sendHeartbeat = this.sendHeartbeat.bind(this);
        this.connect = this.connect.bind(this);

        this.init();
    }

    _createClass(Pulsatio, [{
        key: 'init',
        value: function init() {
            if (this.options.mode === 'server') {
                this.initServer();
            } else {
                this.initClient();
            }
        }
    }, {
        key: 'initServer',
        value: function initServer() {
            var _this = this;

            var address = void 0;
            if (this.express.address) {
                try {
                    address = this.express.address();
                } catch (err) {}
            }

            var bodyParser = require('body-parser');
            this.express.use(bodyParser.json());

            if (!address) {
                this.express.listen(this.options.port, function () {
                    _this.log('Pulsat.io @ ' + _this.options.port);
                });
            }

            this.initServerEndpoints();
        }
    }, {
        key: 'initServerEndpoints',
        value: function initServerEndpoints() {
            this.express.put('/nodes/:id', this.pulsatio);
            this.express.get('/nodes/:id', this.getNode);
            this.express.get(this.ENDPOINTS.getAllNodes, this.getAllNodes);
            this.express.post(this.ENDPOINTS.register, this.registerNewNode);
            this.express.delete('/nodes/:id', this.deregisterNode);
        }
    }, {
        key: 'pulsatio',
        value: function pulsatio(req, res) {
            var _this2 = this;

            var node = this.nodes[req.params.id];

            if (node) {
                clearTimeout(node.timeout);
                this.nodes[req.params.id].online = true;
                this.nodes[req.params.id].lastHeartbeat = new Date();
                this.nodes[req.params.id].timeout = setTimeout(function () {
                    _this2.nodes[req.params.id].online = false;
                }, node.interval * this.options.interval_timeout);

                res.sendStatus(200);
            } else {
                res.sendStatus(404);
            }
        }
    }, {
        key: 'getNode',
        value: function getNode(req, res) {
            if (!res) {
                return this.clearNode(this.nodes[req]);
            } else {
                res.send(this.clearNode(this.nodes[req.params.id]));
            }
        }
    }, {
        key: 'getAllNodes',
        value: function getAllNodes(req, res) {
            if (!res) {
                return this.clearNode(this.nodes, true);
            } else {
                res.send(this.clearNode(this.nodes, true));
            }
        }
    }, {
        key: 'registerNewNode',
        value: function registerNewNode(req, res) {
            var info = req.body;
            info.online = true;

            if (info.id && this.nodes[info.id]) {
                res.send({ info: 'Already registered!' });
                return;
            }
            if (!info.id) {
                info.id = uuidv4();
            }

            info.registeredAt = new Date();
            info.lastHeartbeat = new Date();
            this.nodes[info.id] = Object.assign({}, info);

            if (this.options.on.connection) {
                this.options.on.connection(res, function () {
                    res.send(info);
                });
            } else {
                res.send(info);
            }
        }
    }, {
        key: 'deregisterNode',
        value: function deregisterNode(req, res) {
            if (!res) {
                this.nodes[req] = null;
                delete this.nodes[req];
            } else {
                this.nodes[req.params.id] = null;
                delete this.nodes[req.params.id];
            }
        }
    }, {
        key: 'initClient',
        value: function initClient() {
            this.connect();
        }
    }, {
        key: 'connect',
        value: function connect() {
            var _this3 = this;

            if (this.options.url) {
                var url = this.options.url + this.ENDPOINTS.register;
                var data = {
                    id: this.options.id,
                    ip: ip(),
                    interval: this.options.interval,
                    hostname: os.hostname()
                };

                request.post(url, { json: data }, function (e, r, body) {
                    if (body && body.id) {
                        _this3.options.id = body.id;
                    }

                    _this3.sendHeartbeat();
                });
            }
        }
    }, {
        key: 'sendHeartbeat',
        value: function sendHeartbeat() {
            var _this4 = this;

            var url = this.options.url + ('/nodes/' + this.options.id);
            var data = {
                ip: ip()
            };

            request.put(url, { json: data }, function (e, r, body) {
                if (r && r.statusCode !== 404) {
                    _this4.timeout = setTimeout(_this4.sendHeartbeat, _this4.options.interval);
                } else {
                    _this4.connect();
                }
            });
        }
    }, {
        key: 'clearNode',
        value: function clearNode(node, multiple) {
            if (multiple === true) {
                var nodes = {};
                for (var n in node) {
                    var copy = Object.assign({}, node[n]);
                    copy.timeout = null;
                    delete copy.timeout;
                    nodes[n] = copy;
                }
                return nodes;
            } else {
                var timeout = node.timeout,
                    ret = _objectWithoutProperties(node, ['timeout']);

                return ret;
            }
        }
    }, {
        key: 'log',
        value: function log() {
            if (this.options.verbose !== false) {
                for (var _len = arguments.length, attrs = Array(_len), _key = 0; _key < _len; _key++) {
                    attrs[_key] = arguments[_key];
                }

                console.log(attrs.join(', '));
            }
        }
    }]);

    return Pulsatio;
}();

function ip() {
    var interfaces = os.networkInterfaces();
    for (var devName in interfaces) {
        var iface = interfaces[devName];

        for (var i = 0; i < iface.length; i++) {
            var alias = iface[i];
            var last_digit = alias.address.substring(alias.address.length - 2, alias.address.length);
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal && last_digit !== '.1') {
                return alias.address;
            }
        }
    }

    return '0.0.0.0';
}

module.exports = Pulsatio;