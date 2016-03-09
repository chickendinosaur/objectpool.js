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
@example
// Create a parent class.

class Person {
    constructor(name) {
        this._name = name;
    }

    init(name) {
        this._name = name;
    }

    dispose() {}
}

// Create a child class.

class Gunner extends Person {
    constructor(name) {
        super(name);

        this._gunType = 'Machine Gun';
        this._bullets = [50];
    }

    // Don't forget to call parent's init if there is one.
    init(name) {
        super.init(name);
    }

    dispose() {
        // Dispose parent.
        super.dispose();

        // Reuse the array.
        const bullets = this._bullets;

        let n = bullets.length;

        for (; n > 0;) {
            bullets.pop();

            --n;
        }
    }
}

// Create a GunnerPool.js file.
// Create and export a new pool to contain Gunners.

import Pool from '@chickendinosaur/pool/Pool';
import Gunner from './GunnerPool.js';

export default new Pool(
    function(name) {
        return new Gunner(name);
        // Or set up defaults for generating up front objects when setting the size or just calling create() with no arguments. (not implemented yet)
        // return new Gunner( name || 'Billy Bob');
    },
    function(name) {
        return this.pull().init(name);
    },
    // The dispose callback parameter also accepts null whick will only
    // use the init callback when calling create();
    function(obj) {
        obj.dispose();
    }
);

// Use the pool anywhere.

import GunnerPool from './GunnerPool.js';

let gunner = GunnerPool.create('Crazy Gunner Guy');

GunnerPool.destroy(gunner);

gunner = GunnerPool.create('Another Gunner Guy');

@class Pool
@param {function} allocatorCallback
@param {function} renewObjectCallback
@param {function|null} disposeObjectCallback
@param {object} config
*/

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = Pool;
function Pool(allocatorCallback, renewObjectCallback, disposeObjectCallback, config) {
    if (typeof allocatorCallback !== 'function') throw new TypeError();else if (typeof renewObjectCallback !== 'function') throw new TypeError();else if (typeof disposeObjectCallback !== 'function' && typeof disposeObjectCallback !== null) throw new TypeError();

    var opts = config || {};

    /**
    Hotswap reference for the allocation and renew callbacks.
    Single point of entry for user friendly api and avoids using .apply(this, arguments).
      @method create
    @param {*} * - Mimics the constructor.
    @return {*} - Newly created object or one from the pool.
    */
    this.create = allocatorCallback;

    /**
    Container for all reusable objects.
      @private
    @property _pool
    @type {array}
    */
    this._pool = [];

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
}

Pool.prototype.constructor = Pool;

/**
Does not create any new objects.
Hot swaps the create ref to the allocation callback for an easy api.

@method pull
@return {*} - object from the pool or null if empty.
*/
Pool.prototype.pull = function () {
    var pool = this._pool;

    // Hot-swap
    if (pool.length === 1) {
        this.create = this._allocatorCallback;
    }

    return pool.pop();
};

/**
Adds an object to the object pool for reuse.
Hot swaps the create ref to the object reuse callback for an easy api.
Disposes the object.

@method destroy
@param {*} obj
*/
Pool.prototype.destroy = function (obj) {
    var pool = this._pool;

    // Put in the pool
    pool[pool.length] = obj;

    // Trigger hot-swap.
    if (pool.length === 1) {
        this.create = this._renewObjectCallback;
    }

    // Dispose the object
    if (this._disposeObjectCallback !== undefined) {
        this._disposeObjectCallback(obj);
    }
};

/**
Dereferences/Clears all objects in the pool.

@method drain
*/
Pool.prototype.drain = function () {
    while (this.pull() !== undefined) {}
};