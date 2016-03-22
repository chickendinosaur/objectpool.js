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

var _Pool = require('./Pool.js');

var _Pool2 = _interopRequireDefault(_Pool);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
Singleton object.
Keeps track of all pools and allows for future debugging features to be easily
implemented. 

@example
// Create a GunnerPool.js file.
// Create and export a new pool to contain Gunners with the pool manager.

import PoolManager from '@chickendinosaur/pool';
import Gunner from './Gunner.js';

export default PoolManager.createPool(
	'GunnerPool',
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

@class PoolManager
*/
function PoolManager() {
    this._pools = {};
    this._poolCount = 0;
}

PoolManager.prototype.constructor = PoolManager;

/**
Creates and stores a new object pool to manage.

@method createPool
@param {string} poolName
@param {function} allocatorCallback
@param {function} renewObjectCallback
@param {function|null} disposeObjectCallback
*/
PoolManager.prototype.createPool = function (poolName, allocatorCallback, renewObjectCallback, disposeObjectCallback) {
    if (typeof poolName !== 'string') throw new TypeError();else if (this._pools[poolName]) throw new Error('Pool for \'' + poolName + '\' already exists.');

    var pool = new _Pool2.default(allocatorCallback, renewObjectCallback, disposeObjectCallback);

    this._pools[poolName] = pool;
    this._poolCount++;

    return pool;
};

exports.default = new PoolManager();