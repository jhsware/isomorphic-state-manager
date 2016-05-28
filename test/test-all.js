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
        var storeController = stateManager.storeFor('/dummy');
        
        expect(storeController).to.be.a(StoreController);
    });
    
    it('can set defaults of store', function() {
        var stateManager = new StateManager(Store);
        var storeController = stateManager.storeFor('/dummy');
        var tmp = storeController.default({data: 'test'});
        
        expect(tmp).to.be.a(StoreController);
    });
    
    it('can subscribe and receives state', function() {
        var stateManager = new StateManager(Store);
        var storeController = stateManager.storeFor('/dummy');
        var result = storeController
            .default({data: 'test'})
            .subscribe(function () {}, this);
        
        expect(result.data).to.equal('test');
    });
    
    it('can get a call to subscriber when updating data', function(done) {
        var stateManager = new StateManager(Store);
        var storeController = stateManager.storeFor('/dummy');

        var didUpdate = function () {
            var state = storeController.getState()
            expect(state.data).to.equal('updated')
            done();
        }
        
        var result = storeController
            .default({data: 'test'})
            .subscribe(didUpdate);
        storeController.update({
            data: 'updated'
        });
    });

    it('can unsubscribe from updates', function(done) {
        var stateManager = new StateManager(Store);
        var storeController = stateManager.storeFor('/dummy')

        var noCall = function () {
            expect(true).to.equal("This shouldn't be called!")
        }
        var didUpdate = function () {
            var state = storeController.getState()
            expect(state.data).to.equal('updated')
            done();
        }
        
        storeController.default({data: 'test'})
        storeController.subscribe(noCall)
        storeController.subscribe(didUpdate)
        storeController.unsubscribe(noCall)
        storeController.update({
            data: 'updated'
        });
    });
    

    
    it('does update version nr in store', function(done) {
        var stateManager = new StateManager(Store);
        var storeController = stateManager.storeFor('/dummy');

        var didUpdate = function () {
            var state = storeController.getState()
            expect(state.__version).to.equal(1);
            done();
        }
        
        var result = storeController
            .default({data: 'test'})
            .subscribe(didUpdate, this);
        expect(result.__version).to.equal(0);
        
        storeController.update({
            data: 'updated'
        });
    });
    
    it('does not mutate old states', function(done) {
        var stateManager = new StateManager(Store);
        var storeController = stateManager.storeFor('/dummy');

        var didUpdate = function (newState) {
            var state = storeController.getState()
            expect(state.data).to.equal('updated');
            expect(result.data).to.equal('test');
            done();
        }
        
        var result = storeController
            .default({data: 'test'})
            .subscribe(didUpdate, this);
        storeController.update({
            data: 'updated'
        });
    });
    
    it('only changes state properties that are passed to update', function(done) {
        var stateManager = new StateManager(Store);
        var storeController = stateManager.storeFor('/dummy');

        var didUpdate = function () {
            var state = storeController.getState()
            expect(state.data).to.equal('updated');
            expect(state.other).to.equal('original');
            done();
        }
        
        var result = storeController
            .default({
                data: 'test',
                other: 'original'
            })
            .subscribe(didUpdate, this);
        expect(result.__version).to.equal(0);
        
        storeController.update({
            data: 'updated'
        });
    });

    // TODO: Allow initializing without providing default data
    
    // TODO: Test that failed call during update marks callback for deletion
    // TODO: Make sure all subscribers marked for deletion are removed on unsubscribe
    // TODO: Handle update if subscriber has failed and been marked for removal


    it('allow hydrating and rehydrating store through state manager', function() {
        
        var stateManager = new StateManager(Store);
        var dummyStore = stateManager.storeFor('/dummy');
        
        var result = dummyStore
            .update({
                data: 'test',
                other: 'original'
            });
        
        var hydratedData = stateManager.hydrate();
        var A = JSON.stringify(hydratedData);
        
        var otherStateManager = new StateManager(Store);
        otherStateManager.rehydrate(JSON.parse(A));
        var B = JSON.stringify(otherStateManager.hydrate());

        // TODO: Make sure store looks EXACTLY the same when rehydrating, otherwise React won't like it!
        expect(A).to.equal(B);
    });


});