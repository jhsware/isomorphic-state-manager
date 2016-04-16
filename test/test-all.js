var assert = require('assert');
var expect = require('expect.js');

var StateManager = require('../lib').StateManager;
var StoreController = require('../lib').StoreController;
var Store = require('../lib').Store;

describe('State Manager', function() {

    it('can be created', function() {
        var stateManager = new StateManager(Store);
        
        expect(stateManager).to.be.a(StateManager);
    });
    
    it('can get a store controller', function() {
        var stateManager = new StateManager(Store);
        var storeController = stateManager.stateFor('/dummy');
        
        expect(storeController).to.be.a(StoreController);
    });
    
    it('can initialize store', function() {
        var stateManager = new StateManager(Store);
        var storeController = stateManager.stateFor('/dummy');
        var tmp = storeController.initialize({data: 'test'});
        
        expect(tmp).to.be.a(StoreController);
    });
    
    it('can subscribe and receives state', function() {
        var stateManager = new StateManager(Store);
        var storeController = stateManager.stateFor('/dummy');
        var result = storeController
            .initialize({data: 'test'})
            .subscribe(function () {}, this);
        
        expect(result.data).to.equal('test');
    });
    
    it('can get a call to subscriber when updating data', function(done) {
        var didUpdate = function (newState) {
            expect(newState.data).to.equal('updated');
            done();
        }
        
        var stateManager = new StateManager(Store);
        var storeController = stateManager.stateFor('/dummy');
        var result = storeController
            .initialize({data: 'test'})
            .subscribe(didUpdate, this);
        storeController.update({
            data: 'updated'
        });
    });

    it('can unsubscribe from updates', function(done) {
        var noCall = function (newState) {
            expect(newState.data).to.equal("This shouldn't be called!");
        }
        var didUpdate = function (newState) {
            expect(newState.data).to.equal('updated');
            done();
        }
        
        var stateManager = new StateManager(Store);
        var storeController = stateManager.stateFor('/dummy');
        storeController.initialize({data: 'test'});
        storeController.subscribe(noCall, this);
        storeController.subscribe(didUpdate, this);
        storeController.unsubscribe(noCall);
        storeController.update({
            data: 'updated'
        });
    });
    

    
    it('does update version nr in store', function(done) {
        var didUpdate = function (newState) {
            expect(newState.__version).to.equal(1);
            done();
        }
        
        var stateManager = new StateManager(Store);
        var storeController = stateManager.stateFor('/dummy');
        var result = storeController
            .initialize({data: 'test'})
            .subscribe(didUpdate, this);
        expect(result.__version).to.equal(0);
        
        storeController.update({
            data: 'updated'
        });
    });
    
    it('does not mutate old states', function(done) {
        var didUpdate = function (newState) {
            expect(newState.data).to.equal('updated');
            expect(result.data).to.equal('test');
            done();
        }
        
        var stateManager = new StateManager(Store);
        var storeController = stateManager.stateFor('/dummy');
        var result = storeController
            .initialize({data: 'test'})
            .subscribe(didUpdate, this);
        storeController.update({
            data: 'updated'
        });
    });
    
    it('only changes state properties that are passed to update', function(done) {
        var didUpdate = function (newState) {
            expect(newState.data).to.equal('updated');
            expect(newState.other).to.equal('original');
            done();
        }
        
        var stateManager = new StateManager(Store);
        var storeController = stateManager.stateFor('/dummy');
        var result = storeController
            .initialize({
                data: 'test',
                other: 'original'
            })
            .subscribe(didUpdate, this);
        expect(result.__version).to.equal(0);
        
        storeController.update({
            data: 'updated'
        });
    });

});