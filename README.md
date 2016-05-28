# Isomorphic State Manager

Create a state machine that keeps your state in named stores. Supports hydration and rehydration to allow server-side rendered single page app to retain state without requiring separate api-calls during first render.

Each update increments a version counter providing a simple check of data integrity.

Example of usage:

    var StateManager = require('isomorphic-state-manager').StateManager
    
    var stateManager = new StateManager(Store)
    
    var sessionStore = stateManager.storeFor('Session')
    
    function callback() {
        var currentState = sessionStore.getState()
        console.log(currentState)
    }
    
    sessionStore.subscribe(callback, callback) // using callback as this
    
    sessionStore.update({userName: "Sebastian"})
    
    /*
        The callback is automatically called on update and outputs the state:
        
        {
            userName: "Sebastian",
            __version: 1
        }
    */

## API Reference

### StateManager ###

    var stateManager = new StateManager( Store )

=> returns a new StateManager instance

*Store* -- the store type you want to use, currently only one available: 

    var Store = require('isomorphic-state-manager').Store

Note: You pass the prorotype, not an instance of Store

##### .stateFor( storeName ) 

=> returns StoreController

_storeName_ -- the name of the store you want to access. If the store doesn't exist it will be created

##### .hydrate()

=> returns a dictionary object containing all stores and current state. Keys correspond to store name

##### .rehydrate( data )

=> returns undefined

*data* -- a dictionary object that corresponds to current state of store. Keys correspond to store name

### StoreController ###

    var sessionStore = stateManager.stateFor('Session')

##### .getState()

=> returns a dictionary object representing the current state of the store

##### .default( data )

=> returns this StoreController (allowing chaining)

*data* -- a dictionary object with the default state. The store is updated for all properties of the dictionary that aren't available in current state. Implementation does a .hasOwnProperty() test.

##### .update( data )

=> returns this StoreController (allowing chaining)

*data* -- a dictionary object that updates current state by shallow merge. Passed object overwrites existing properties

##### .replace( data )

=> returns this StoreController (allowing chaining)

*data* -- a dictionary object replacing current state entirely

##### .subscribe( callback, thisArg )

=> returns current state (convenience, allowing us to skip an additional .getState())

*callback* -- a function to call (without params) when the store has been updated

*thisArg* -- sets this when invoking the callback

##### .unsubscribe( callback, thisArg )

=> returns undefined

*callback* -- the function callback we want to remove (same as used for .subscribe)

*thisArg* -- thisArg of the callback we want to remove (same as used for .subscribe)

*NOTE:* You need to provide both callback and thisArg in order to unsubscribe properly when used with for example React

### TODO ###

DONE: add .replace
DONE: change .initialize to .defaults and always initialize
DONE: implement .hydrate and .rehydrate to serialize and deserialize store
TODO: Allow passing data when initializing store but only for rehydrating


TODO: Allow deep copy

TODO: How to create a test-driver?

### DONE ###
DONE: Create package and set up tests so we can start to see if this works.
