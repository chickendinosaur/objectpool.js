/**
@license
The MIT License (MIT)

Copyright (c) 2016 John Pittman

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

'use strict';

import EventEmitter from '@chickendinosaur/eventemitter';
import Event from '@chickendinosaur/eventemitter/Event';

/*
Events
*/

function StatsChangedEvent(type){
    Event.call(this, type);

    this.allocated = null;
    this.free = null;
    this.used = null;
    this.size = null;
}

/**
@class Pool
@param {function} allocatorCallback
@param {function} renewObjectCallback
@param {object} config
*/
export default function Pool(
    allocatorCallback,
    renewObjectCallback,
    disposeObjectCallback,
    config
) {
    if (typeof allocatorCallback !== 'function')
        throw new TypeError();
    else if (typeof renewObjectCallback !== 'function')
        throw new TypeError();
    else if (typeof disposeObjectCallback !== 'function')
        throw new TypeError();

    const opts = config || Pool.Defaults;

    /**
    Hotswap reference for the allocation and renew callbacks.
    Single point of entry for user friendly api and avoids using 'arguments'.
    This was a light-bulb that clicked on at the last second!

    @method create
    @param {*} * - Mimics the constructor.
    @return {*} - Newly created object or one from the pool.
    */
    this.create = allocatorCallback

    /**
    Container for all reusable objects.

    @private
    @property _pool
    @type {array}
    */
    this._pool = [];

    /**
    Represents the current number of of objects not being used.
    _freeCount - 1 represents the index of the next object to use on get.

    @private
    @property _freeCount
    @type {number}
    */
    this._freeCount = 0;

    /**
    @private
    @method _renewObjectCallback
    @param {*} * - Mimics the constructor.
    @return {*} - Object from the pool.
    */
    this._renewObjectCallback = renewObjectCallback;

    /**
    @private
    @method _disposeObjectCallback
    @param {*} obj - Object to being added to the pool.
    */
    this._disposeObjectCallback = disposeObjectCallback;

    /**
    @private
    @method _allocatorCallback
    @param {*} * - Mimics the constructor.
    @return {*} - A new object.
    */
    this._allocatorCallback = allocatorCallback;

    /**
    @private
    @property _debug
    @type {boolean}
    */
    this._debug = null;

    /**
    Total number of objects that have been created by the instance of the pool.

    @private
    @property _allocatedCount
    @type {number}
    */
    this._allocatedCount = 0;

    /*
    Initialize all public facing values.
    */

    /**
    @property debug
    @type {boolean}
    */
    this.debug = opts.debug;

    /*
    Events
    */
    this.Events = {
        new StatsChangedEvent('statschanged')
    };
}

Pool.Defaults = {
    debug: true,
};

Pool.prototype = {
    /**
    Does not create any new objects.
    Hot swaps the create ref to the allocation callback for an easy api.

    @method get
    @return {*} - object from the pool or null if empty.
    */
    get: function() {
        if (this._freeCount > 0) {
            // Hot-swap
            if (this._freeCount === 1) {
                if (this._debug) {
                    this.create = this._allocatorCallback_debug;
                } else {
                    this.create = this._allocatorCallback;
                }
            }

            return this._pool[--this._freeCount];
        } else {
            return null;
        }
    },

    /**
    Adds an object to the object pool for reuse.
    Hot swaps the create ref to the object reuse callback for an easy api.
    Disposes the object.

    @method destroy
    @param {*} obj
    */
    destroy: function(obj) {
        this._pool[this._freeCount++] = obj;

        // Trigger hot-swap.
        if (this._freeCount === 1) {
            this.create = this._renewObjectCallback;
        }

        this._disposeObjectCallback(obj);
    },

    /**
    Mimics _allocatorCallback.
    Applies extra debug functionality.
    Note: Since allocation is done in a separate method the is not internally
    created by the object pool, the only way to track allocation is be wrapping
    the allocatorCallback and doing debug logic within the wrapper.

    @method _allocatorCallback_debug
    @return {*} - object from the pool or null if empty.
    */
    _allocatorCallback_debug: function() {
        this._allocatedCount++;

        return this._allocatorCallback.apply(this, arguments);
    },

    /**
    Dereferences/Clears all objects in the pool.

    @method drain
    */
    drain: function() {
        const pool = this._pool;
        let n = this._pool.length;

        for (; n > 0;) {
            --n;

            pool.pop();
        }
    },

    /**
    Setter.
    Enables or disables object allocation tracing.
    Hot-swaps the allocator callback with the debug one.

    @method debug
    */
    set debug: function(value) {
        this._debug = value;

        // Hot-swap
        if (this.create === this._allocatorCallback) {
            this.create = this._allocatorCallback_debug;
        }
    }

    onStatChanged:function(){
        this.triggerEvent(statChanged)
    }
};

// how to overwrite object constructor for debugging.
classRefCopy=classRef;
classRef=function(){
    thisRef._allocatedCount++;
    
    classRefCopy.apply(this.arguments);
}

