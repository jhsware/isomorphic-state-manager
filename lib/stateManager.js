'use strict';

var Store = require('./store').Store;

var StoreController = function (Store) {
    this.Store = Store;
    this.store;
}

StoreController.prototype.initialize = function (defaultData) {
    // Create store and intialize it with incoming data if
    // it doesn't exist
    if (!this.store) {
        this.store = new this.Store(defaultData);
    }
    
    return this;
}

StoreController.prototype.subscribe = function (callback, thisArg) {
    this.initialize({});
    return this.store.addSubscriber(callback, thisArg);
}

StoreController.prototype.unsubscribe = function (callback) {
    if (this.store) this.store.removeSubscriber(callback);
}

StoreController.prototype.update = function (data) {
    if (!this.store) {
        // TODO: Raise error "updating a store that hasn't been initialized"
        return
    }
    this.store.updateState(data);
}

module.exports.StoreController = StoreController;


var StateManager = function (Store) {
    this.Store = Store;
    
    this.storeControllers = {};
    this.history = []; // TODO: Store history of changes cross stores (should these be done in application code?)
}

StateManager.prototype.stateFor = function (key) {
    if (!this.storeControllers[key]) {
        this.storeControllers[key] = new StoreController(this.Store);
    }
    return this.storeControllers[key];
}


StateManager.prototype.recallVersion = function (version) {
}

module.exports.StateManager = StateManager;
