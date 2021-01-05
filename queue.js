const uuidv4 = require('uuid/v4')

class Queue {
    constructor() {
        this.nodes = {};
    }

    add(id, data) {
        if (!this.nodes[id]) this.nodes[id] = [];
        data._message_id = uuidv4();
        this.nodes[id].push(data);
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
                    return true;
                }
            }
        }
        return false;
    }
}

module.exports = Queue;