/**
@license
GNU GENERAL PUBLIC LICENSE

Version 3, 29 June 2007

Copyright (c) 2016 John Pittman

Everyone is permitted to copy and distribute verbatim copies of this license document, but changing it is not allowed.
*/

'use strict';

/**
@class Pool
@param {function} allocatorCallback
@param {function} renewObjectCallback
@param {object} config
*/

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = Pool;
function Pool(allocatorCallback, renewObjectCallback, config) {
    var opts = config || Pool.Defaults;

    /**
    Hotswap reference for the allocation and renew callbacks.
    Single point of entry for user friendly api and avoids using 'arguments'.
    This was a light-bulb that clicked on at the last second!
      @method create
    @param {*} * - Mimics the constructor.
    @return {*} - Newly created object or one from the pool.
    */
    this.create = allocatorCallback;

    /**
    Container for all reusable objects.
      @property _pool
    @type {array}
    */
    this._pool = opts.size > 0 ? [opts.size - 1] : [];

    /**
    Represents the current number of of objects not being used.
    _poolCount - 1 represents the index of the next object to use on get.
      @property _poolCount
    @type {number}
    */
    this._poolCount = 0;

    /**
    @method _allocatorCallback
    @param {*} * - Mimics the constructor.
    @return {*} - A new object.
    */
    this._allocatorCallback = allocatorCallback;

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
    this._disposeObjectCallback = null;

    /**
    Total number of objects that have been created by the instance of the pool.
      @property _allocatedCount
    @type {number}
    */
    this._allocatedCount = 0;

    this._tracing = opts.tracing || Pool.Defaults.tracing;
}

Pool.Defaults = {
    tracing: false
};

Pool.prototype = {
    constructor: Pool,

    /**
    Does not create and new objects.
    Hot swaps the create ref to the allocation callback for an easy api.
      @method get
    @return {*} - object from the pool or null if empty.
    */
    get: function get() {
        if (this._poolCount > 0) {
            // Hot-swap
            if (this._poolCount === 1) {
                this.create = this._allocatorCallback;
            }

            return this._pool[--this._poolCount];
        } else {
            return null;
        }
    },

    /**
    Adds an object to the object pool for reuse.
    Hot swaps the create ref to the object reuse callback for an easy api.
      @method put
    @param {*} obj
    */
    put: function put(obj) {
        this._pool[this._poolCount++] = obj;

        // Trigger the hot-swap.
        if (this._poolCount === 1) {
            this.create = this._renewObjectCallback;
        }
    }
};