'use strict';

var Store = function (initialState) {
    if (typeof initialState !== 'object') {
        return // TODO: Raise an error
    }
    this.state = initialState;
    this.state.__version = 0;
    this.stateHistory = [];
    // TODO: Add initial state to history
    this.subscribers = []; // Each item is on form [callback, thisArg]
}

Store.prototype.addSubscriber = function (callback, thisArg) {
    var exists;
    for (var i = 0; i < this.subscribers.length; i++) {
        exists = this.subscribers[i][0] === callback
        if (exists) break;
    }
    if (!exists) this.subscribers.push([callback, thisArg]);
    return this.state;
}

Store.prototype.removeSubscriber = function (callback) {
    for (var i = 0; i < this.subscribers.length; i++) {
        if (this.subscribers[i][0] === callback) {
            this.subscribers.splice(i, 1);
            return;
        }
    }
}

Store.prototype.updateState = function (newState) {
    if (typeof newState !== 'object') {
        return // TODO: Throw error
    }
    // Create new state object
    var tmp = {};
    // Add new props
    for (var key in newState) {
        if (newState.hasOwnProperty(key)) {
            tmp[key] = newState[key]
        }
    }
    // Add old props
    for (var key in this.state) {
        if (this.state.hasOwnProperty(key)) {
            tmp[key] = tmp[key] || this.state[key]
        }
    }
    tmp.__version++;
    this.state = tmp;
    this.stateHistory.push(tmp);
    
    // TODO: Register version change with timemachine

    for (var i = 0; i < this.subscribers.length; i++) {
        // TODO: Do this on animationFrame if available
        this.subscribers[i][0].call(this.subscribers[i][1], this.state)
    }
}

Store.prototype.recallVersion = function (version) {
    for (var i = 0; i < this.subscribers.length; i++) {
        this.subscribers[i][0].call(this.subscribers[i][1], this.stateHistory[version])
    }
}

module.exports.Store = Store;