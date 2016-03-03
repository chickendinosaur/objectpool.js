'use strict';

const path = require('path');
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'package.json'), 'utf-8'));
const ObjectPool = require(path.join('..', '..', 'dist', 'ObjectPool')).default;

describe('ObjectPool', function() {
    let objectPool;

    function TestClass() {
        this._name = 'Name';
    }
    TestClass.prototype = {
        init: function(name) {
        	this._name = name;
        },
        release: function() {
            this._name = '';
        }
    };

    function init() {
        objectPool = new ObjectPool(TestClass);
    }

    beforeEach(function() {
        init();
    });

    describe('get', function() {
        it('Creates a new instance when pool is emtpy.', function() {
            let obj = objectPool.get();
            expect(obj instanceof TestClass).toBe(true);
        });
        it('Gets recycled object from the pool when there are some.', function() {
            let obj = objectPool.get();
            objectPool.put(obj);
            expect(objectPool._pool.length).toBe(1);
            obj = objectPool.get();
            expect(objectPool._pool.length).toBe(0);
        });
    });

    describe('put', function() {
        it('Resets the object.', function() {
            let obj = objectPool.get();
            objectPool.put(obj);
            expect(obj._name).toBe('');
        });
        it('Adds an object to the pool', function() {
        	let obj = objectPool.get();
            objectPool.put(obj);
            expect(objectPool._pool.length).toBe(1);
        });
    });
});
