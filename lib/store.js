'use strict';

var shallowCopyProps = function (source, target, overwrite) {
    // Add new props
    for (var key in source) {
        if (source.hasOwnProperty(key) && !(target.hasOwnProperty(key) && !overwrite)) {
            target[key] = source[key]
        }
    }
    return target;
}

var Store = function (initialState) {
    if (typeof initialState !== 'undefined' && typeof initialState !== 'object') {
        throw "ERROR! initialState can only be an object!";
    }
    
    if (initialState) {
        this.state = initialState;
    } else {
        this.state = {};
        this.state.__version = this.state.__version || 0;        
    }
    this.stateHistory = [this.state];
    this.subscribers = []; // Each item is on form [callback, thisArg]
}

Store.prototype.addSubscriber = function (callback, thisArg) {
    var exists;
    for (var i = 0; i < this.subscribers.length; i++) {
        exists = Array.isArray(this.subscribers[i]) && this.subscribers[i][0] === callback;
        if (exists) break;
    }
    if (!exists) this.subscribers.push([callback, thisArg]);
    return this.state;
}

Store.prototype.removeSubscriber = function (callback) {
    for (var i = 0; i < this.subscribers.length; i++) {
        if (this.subscribers[i][0] === callback) {
            // Mark for deletion
            this.subscribers[i] = undefined;
            break;
        }
    }
    // Remove all subscribers marked for deletion (cleaning up failed ones too)
    this.subscribers = this.subscribers.filter(function (item) { return item });
}

Store.prototype.getState = function () {
    return this.state;
}

Store.prototype.defaultState = function (newState) {
    /*
        Passed data is used as default state if no state is set
    */
    if (typeof newState !== 'object') {
        return // TODO: Throw error
    }
    
    // Creat a new state object
    var tmpState = shallowCopyProps(this.state, {});
    
    // Only add defaults if properties aren't set
    var tmpState = shallowCopyProps(newState, tmpState, false);
    
    this.state = tmpState;
    if (this.state.__version !== 0) {
        tmpState.__version++;
        this.stateHistory.push(tmpState);
    } else {
        this.stateHistory[0] = tmpState;
    }

    // TODO: Register version change with timemachine
    for (var i = 0; i < this.subscribers.length; i++) {
        if (this.subscribers[i] !== undefined) {
            // TODO: Do this on animationFrame if available
            try {
                this.subscribers[i][0].call(this.subscribers[i][1], this.state)
            } catch (e) {
                // On fail remove subscriber
                this.subscribers[i] = undefined;
            }
              
        }
    }
}

Store.prototype.updateState = function (newState) {
    if (typeof newState !== 'object') {
        return // TODO: Throw error
    }
    // Create new state object
    var tmpState = shallowCopyProps(newState, {});
    
    // Add old props
    tmpState = shallowCopyProps(this.state, tmpState);
    
    tmpState.__version++;
    this.state = tmpState;
    this.stateHistory.push(tmpState);
    
    // TODO: Register version change with timemachine

    for (var i = 0; i < this.subscribers.length; i++) {
        if (this.subscribers[i] === undefined) {
            continue;
        }
        // TODO: Do this on animationFrame if available
        try {
            this.subscribers[i][0].call(this.subscribers[i][1], this.state)
        } catch (e) {
            // On fail remove subscriber
            this.subscribers[i] = undefined;
        }
    }
}

Store.prototype.replaceState = function (newState) {
    if (typeof newState !== 'object') {
        return // TODO: Throw error
    }
    // Create new state object
    var tmpState = shallowCopyProps(newState, {});
    
    tmpState.__version++;
    this.state = tmpState;
    this.stateHistory.push(tmpState);
    
    // TODO: Register version change with timemachine

    for (var i = 0; i < this.subscribers.length; i++) {
        if (this.subscribers[i] !== undefined) {
            // TODO: Do this on animationFrame if available
            try {
                this.subscribers[i][0].call(this.subscribers[i][1], this.state)
            } catch (e) {
                // On fail remove subscriber
                this.subscribers[i] = undefined;
            }
              
        }
    }
}

Store.prototype.recallVersion = function (version) {
  
    this.state = this.stateHistory[version]
  
    for (var i = 0; i < this.subscribers.length; i++) {
        if (this.subscribers[i] !== undefined) {
            this.subscribers[i][0].call(this.subscribers[i][1], this.stateHistory[version])
        }
    }
}

module.exports.Store = Store;