'use strict';

const path = require('path');
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'package.json'), 'utf-8'));
const ObjectPool = require(path.join('..', '..', 'dist', 'ObjectPool')).default;

describe('ObjectPool', function() {
    let objectPool;
    // const poolConfig = {
    //     poolSize: 5
    // };

    function TestClass() {
        this._name = 'Name';
    }
    TestClass.prototype = {
        dispose: function() {
            this._name = '';
        }
    };

    function creationCallback() {
        return new TestClass();
    }

    function init() {
        objectPool = new ObjectPool(creationCallback);
    }

    beforeEach(function() {
        init();
    });

    describe('get', function() {
        it('Creates a new instance when pool is empty.', function() {
            let obj = objectPool.get();
            expect(objectPool._allocatedCount).toBe(1);
            expect(obj instanceof TestClass).toBe(true);
        });
        it('Gets recycled object from the pool when there are some.', function() {
            let obj = objectPool.get();
            objectPool.put(new TestClass());
            obj = objectPool.get();
            expect(objectPool._poolCount).toBe(0);
        });
    });

    describe('put', function() {
        it('Adds to the pool count.', function() {
            objectPool.put(new TestClass());
            expect(objectPool._poolCount).toBe(1);
        });
        it('Expands the pool container.', function() {
            objectPool.put(new TestClass());
            expect(objectPool._pool.length).toBe(1);
        });
    });

    describe('expand', function() {
        it('Increases the object count of the pool by x amount.', function() {
            objectPool.expand(5);
            expect(objectPool._poolCount).toBe(5);
            expect(objectPool._pool.length).toBe(5);
        });
        it('Only increases the container size when the pool runs out of room.', function() {
            objectPool.expand(5);
            objectPool.get();
            objectPool.expand(5);
            expect(objectPool._poolCount).toBe(9);
            expect(objectPool._pool.length).toBe(9);
        });
    });
});
