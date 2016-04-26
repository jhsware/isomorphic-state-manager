'use strict';

var Store = require('./store').Store;

var StoreController = function (Store, initialState) {
    this.Store = Store;
    this.store = new this.Store(initialState);;
}

StoreController.prototype.getState = function () {
    return this.store.getState();
}

StoreController.prototype.subscribe = function (callback, thisArg) {
    return this.store.addSubscriber(callback, thisArg);
}

StoreController.prototype.unsubscribe = function (callback) {
    if (this.store) this.store.removeSubscriber(callback);
}

StoreController.prototype.default = function (data) {
    if (!this.store) {
        // TODO: Raise error "updating a store that hasn't been initialized"
        return
    }
    this.store.defaultState(data);
    return this;
}

StoreController.prototype.replace = function (data) {
    if (!this.store) {
        // TODO: Raise error "updating a store that hasn't been initialized"
        return
    }
    this.store.replaceState(data);
    return this;
}

StoreController.prototype.update = function (data) {
    if (!this.store) {
        // TODO: Raise error "updating a store that hasn't been initialized"
        return
    }
    this.store.updateState(data);
    return this;
}

module.exports.StoreController = StoreController;


var StateManager = function (Store) {
    this.Store = Store;
    
    this.storeControllers = {};
    this.history = []; // TODO: Store history of changes cross stores (should these be done in application code?)
}

StateManager.prototype.storeFor = function (key) {
    if (!this.storeControllers[key]) {
        this.storeControllers[key] = new StoreController(this.Store);
    }
    return this.storeControllers[key];
}

StateManager.prototype.hydrate = function () {
    var outp = {};
    for (var key in this.storeControllers) {
        outp[key] = this.storeControllers[key].getState();
    }
    return outp;
}

StateManager.prototype.rehydrate = function (data) {
    for (var key in data) {
        this.storeControllers[key] = new StoreController(this.Store, data[key]);
    }
}

StateManager.prototype.recallVersion = function (version) {
}

module.exports.StateManager = StateManager;
