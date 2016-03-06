'use strict';

const path = require('path');
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'package.json'), 'utf-8'));
const ObjectPool = require(path.join('..', '..', 'dist', 'ObjectPool')).default;

describe('ObjectPool', function() {
    let objectPool;

    function PooledObject(name) {
        this._name = name || 'Name';

        this.arr = [];
        this.b = {};
    }

    PooledObject.prototype = {
        constructor: PooledObject,
        init: function(name) {
            this._name = name;

            return this;
        },
        dispose: function() {
            this._name = '';
        }
    };

    var allocatorCallback = function(name) {
        return new PooledObject(name);
    };

    var renewObjectCallback = function(name) {
        return this.get().init(name);
    };

    function init() {
        objectPool = new ObjectPool(
            allocatorCallback,
            renewObjectCallback, {}
        );
    }

    beforeEach(function() {
        init();
    });

    describe('create', function() {
        it('Creates a new object.', function() {
            let obj=objectPool.create();
            expect(obj instanceof PooledObject).toBe(true);
        });
        it('Reuses an object from the pool.', function() {
            objectPool.put(new PooledObject());
            let obj = objectPool.create();
            expect(objectPool._poolCount).toBe(0);
            expect(obj instanceof PooledObject).toBe(true);
        });
    });

    describe('get', function() {
        it('Returns null when there are no available object in the pool.', function() {
            let obj = objectPool.get();
            expect(objectPool._poolCount).toBe(0);
            expect(obj).toBe(null);
        });
        it('Hot-swaps the create method to the allocatorCallback when pool goes empty.', function() {
            objectPool.get();
            expect(objectPool.create).toBe(allocatorCallback);
        });
        it('Gets recycled object from the pool when there are some.', function() {
            objectPool.put(new PooledObject());
            let obj = objectPool.get();
            expect(objectPool._poolCount).toBe(0);
        });
    });

    describe('put', function() {
        it('Adds an object to the pool count.', function() {
            objectPool.put(new PooledObject());
            expect(objectPool._poolCount).toBe(1);
        });
        it('Expands the pool container when needed.', function() {
            objectPool.put(new PooledObject());
            objectPool.get();
            objectPool.put(new PooledObject());
            expect(objectPool._pool.length).toBe(1);
        });
        it('Hot-swaps the create method to the renewObjectCallback when pool has objects.', function() {
            objectPool.put();
            expect(objectPool.create).toBe(renewObjectCallback);
        });
    });
});
