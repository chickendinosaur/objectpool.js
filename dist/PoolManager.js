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

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Pool = undefined;

var _Pool = require('./Pool.js');

var _Pool2 = _interopRequireDefault(_Pool);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.Pool = _Pool2.default;

/**
Keeps track of all pools and allows for future debugging features to be easily
implemented.

@example
// Here are a couple of example classes for better visualization.

// Create a test parent class.
class Person {
    constructor(name) {
        this._name = name;
    }

    init(name) {
        this._name = name;
    }

    dispose() {}
}

// Create a test child class.
class Gunner extends Person {
    constructor(name) {
        super(name);

        this._gunType = 'Machine Gun';
        // This is replaced by a bullet pool in production.
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

        // Note: In reality we would use a Bullet pool for all bullets which means there would be no need
        // to store bullet here in the first place. Each time a bullet is need we would
        // do a BulletPool.create() and BulletPool.destroy(bullet) so there's nothing to clean up here
        // unless there's never going to be anymore bullets used again which would mean we would
        // do a BulletPool.drain() to get the memory back.
        while (bullets.length > 0) {
            bullets.pop();
        }
    }
}

// Create a GunnerPool.js file.
// Create and export a new pool to contain Gunners with the pool manager.

import PoolManager from '@chickendinosaur/pool';
import Gunner from './GunnerPool.js';

export default PoolManager.createPool(
	// Should use the name of the objects' constructor to pool.
	// Functionality may be added in the future for ease of use using
	the object constructor.
	'Gunner',
    function(name) {
        return new Gunner(name);
        // Or set up defaults for generating up front objects when setting the size or just calling create() with no arguments. (not implemented yet)
        // return new Gunner( name || 'Billy Bob');
    },
    function(name) {
        return this.pull().init(name);
    },
    // The dispose callback parameter also accepts null which will only
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

@class PoolManager
*/

function PoolManager() {
    this._pools = {};
}

PoolManager.prototype.constructor = PoolManager;

/**
Stores a new object pool to manage.

@method addPool
@param {string} objectName
@param {Pool} pool
*/
PoolManager.prototype.addPool = function (objectName, pool) {
    if (typeof objectName !== 'string') throw new TypeError();else if (this._pools[objectName]) throw new Error('Pool \'' + objectName + '\' already exists.');

    this._pools[objectName] = pool;
};

/**
Creates and stores a new object pool to manage.

@method createPool
@param {string} objectName
@param {function} allocatorCallback
@param {function} renewObjectCallback
@param {function|null} disposeObjectCallback
*/
PoolManager.prototype.createPool = function (objectName, allocatorCallback, renewObjectCallback, disposeObjectCallback) {
    var pool = new _Pool2.default(allocatorCallback, renewObjectCallback, disposeObjectCallback);

    this.addPool(objectName, pool);

    return pool;
};

exports.default = new PoolManager();