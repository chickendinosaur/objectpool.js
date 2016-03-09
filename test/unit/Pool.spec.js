'use strict';

const path = require('path');
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'package.json'), 'utf-8'));
const Pool = require(path.join('..', '..', 'dist', 'Pool')).default;

describe('Pool', function() {
    function PooledObject(name) {
        this._name = name || 'Name';
        this._disposed = false;

        this._obj = {};
    }

    PooledObject.prototype = {
        constructor: PooledObject,
        init: function(name) {
            this._name = name;
            this._obj = {};

            return this;
        },
        dispose: function() {
            this._obj = null;
        }
    };

    var allocatorCallback = function(name) {
        return new PooledObject(name);
    };

    var renewObjectCallback = function(name) {
        return this.pull().init(name);
    };

    var disposeObjectCallback = function(obj) {
        obj._disposed = true;
    };

    let objectPool = new Pool(
        function(name) {
            return new PooledObject(name);
        },
        function(name) {
            return this.pull().init(name);
        },
        function(obj) {
            obj._disposed = true;
        }
    );

    beforeEach(function() {
        objectPool = new Pool(
            allocatorCallback,
            renewObjectCallback,
            disposeObjectCallback, {
                size: 0
            }
        );
    });

    describe('create', function() {
        it('Creates a new object.', function() {
            let obj = objectPool.create('Derp');
            expect(obj instanceof PooledObject).toBe(true);
        });
        it('Reuses an object from the pool.', function() {
            objectPool.destroy(new PooledObject());
            let obj = objectPool.create();
            expect(objectPool._pool.length).toBe(0);
            expect(obj instanceof PooledObject).toBe(true);
        });
    });

    describe('pull', function() {
        it('Returns null when there are no available object in the pool.', function() {
            let obj = objectPool.pull();
            expect(objectPool._pool.length).toBe(0);
            expect(obj).toBe(undefined);
        });
        it('Hot-swaps the create method to the allocatorCallback when pool goes empty.', function() {
            objectPool.destroy(new PooledObject());
            objectPool.pull();
            expect(objectPool.create).toBe(allocatorCallback);
        });
        it('Gets recycled object from the pool when there are some.', function() {
            objectPool.destroy(new PooledObject());
            let obj = objectPool.pull();
            expect(objectPool._pool.length).toBe(0);
        });
    });

    describe('destroy', function() {
        it('Adds an object to the pool count.', function() {
            objectPool.destroy(new PooledObject());
            expect(objectPool._pool.length).toBe(1);
        });
        it('Expands the pool container when needed.', function() {
            objectPool.destroy(new PooledObject());
            objectPool.pull();
            objectPool.destroy(new PooledObject());
            expect(objectPool._pool.length).toBe(1);
        });
        it('Hot-swaps the create method to the renewObjectCallback when pool has objects.', function() {
            objectPool.destroy(new PooledObject());
            expect(objectPool.create).toBe(renewObjectCallback);
        });
        it('Executes the dispose object callback of the pool.', function() {
            let obj = new PooledObject();
            objectPool.destroy(obj);
            expect(obj._disposed).toBe(true);
        });
    });
});
