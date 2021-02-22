const uuidv4 = require('uuid/v4')

class Queue {
    constructor() {
        this.nodes = {};
        this.callbacks = {};
    }

    add(id, data, cb) {
        if (!this.nodes[id]) this.nodes[id] = [];
        data._message_id = uuidv4();
        this.nodes[id].push(data);
        this.callbacks[data._message_id] = cb;
        return data._message_id;
    }

    remove(id, message_id) {
        if (this.nodes[id]) {
            for (let i = 0; i < this.nodes[id].length; i++) {
                if (this.nodes[id][i]._message_id === message_id) {
                    this.nodes[id].splice(i, 1);
                    return true;
                }
            }
        }
        return false;
    }

    get(id) {
        return (this.nodes[id] || [])[0];
    }

    clear(id, message_id) {
        let node = this.nodes[id];
        if (node) {
            for (let m = 0; m < node.length; m++) {
                let message = node[m];
                if (message._message_id === message_id) {
                    this.nodes[id].splice(m, 1);

                    if (this.callbacks[message_id]) {
                        try {
                            this.callbacks[message_id]();
                            delete this.callbacks[message_id];
                        } catch (err) { console.log(err); }
                    }

                    return true;
                }
            }
        }
        return false;
    }
}

module.exports = Queue;