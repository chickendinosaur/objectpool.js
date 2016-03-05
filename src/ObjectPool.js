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
@class ObjectPool
@param {function} creationCallback - Encapsulate the creation of an object outside
of the object pool to avoid having to access 'arguments' and call apply.
*/
export default function ObjectPool(creationCallback, config) {
    const defaultConfig = config || ObjectPool.DefaultConfig;

    this._pool = defaultConfig.poolSize > 0 ? [defaultConfig.poolSize - 1] : [];

    /**
    Represent the current number of of objects not being used.
    _poolCount - 1 represents the index of the next object to use on get.

    @property _poolCount
    @type {number}
    */
    this._poolCount = 0;

    /**
    Total number of objects that have been created by the instance of the pool.

    @property _allocatedCount
    @type {number}
    */
    this._allocatedCount = 0;

    this._creationCallback = creationCallback;

    if (defaultConfig.poolSize > 0) {
        this.expand(defaultConfig.poolSize - 1);
    }
}

ObjectPool.DefaultConfig = {
    poolSize: 0
};

ObjectPool.create = function(createCallback, config) {
    return new ObjectPool(createCallback, config);
}

ObjectPool.prototype = {
    constructor: ObjectPool,

    /**
    Returns a free object if available.
    Creates a new object and adds it to the pool if none are available.
    Note: The current implementation is to not set any used index to null
    to avoid an extra index look-up operation for performance.

    @method get
    */
    get: function() {

        // Check for free objects.
        // Return an available object from the end of pool.
        if (this._poolCount > 0) {
            return this._pool[--this._poolCount];
        } else {
            this._allocatedCount++;
            return this._creationCallback();
        }
    },

    /**
        Adds an object to the object pool for reuse.

        @method put
        @param {*} obj
        */
    put: function(obj) {
    	if(obj.dispose !== undefined){
    		obj.dispose();
    	}
    	
        this._pool[this._poolCount++] = obj;
    },

    /**
    Allocates new objects for the pool.

    @method expand
    @param {number} amount - Number of objects to add to the pool.
    */
    expand: function(amount) {
        // Fill pool.
        const creationCallback = this._creationCallback;

        let i = 0;
        
        for (; i < amount;) {
            this._allocatedCount++;
            this.put(creationCallback());

            ++i;
        }
    }
};