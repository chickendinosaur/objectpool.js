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

    @property _pool
    @type {array}
    */
    this._pool = opts.size > 0 ? [opts.size - 1] : [];

    /**
    Represents the current number of of objects not being used.
    _freeCount - 1 represents the index of the next object to use on get.

    @property _freeCount
    @type {number}
    */
    this._freeCount = 0;

    /**
    @method _renewObjectCallback
    @param {*} * - Mimics the constructor.
    @return {*} - Object from the pool.
    */
    this._renewObjectCallback = renewObjectCallback;

    /**
    @method _disposeObjectCallback
    @param {*} obj - Object to being added to the pool.
    */
    this._disposeObjectCallback = disposeObjectCallback;

    /**
    @method _allocatorCallback
    @param {*} * - Mimics the constructor.
    @return {*} - A new object.
    */
    this._allocatorCallback = allocatorCallback;

    /**
    Total number of objects that have been created by the instance of the pool.

    @property _allocatedCount
    @type {number}
    */
    this._allocatedCount = 0;

    this._tracking = opts.tracking || Pool.Defaults.tracking;
}

Pool.Defaults = {
    size: 0,
    tracking: false
};

Pool.prototype = {
    constructor: Pool,

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
                this.create = this._allocatorCallback;
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

        // Trigger the hot-swap.
        if (this._freeCount === 1) {
            this.create = this._renewObjectCallback;
        }

        this._disposeObjectCallback(obj);
    }
};