'use strict';

const path = require('path');
const PoolManager = require(
    path.join('..', '..', 'dist', 'PoolManager.js')
).default;
const Pool = require(path.join('..', '..', 'dist', 'Pool.js')).default;

describe('PoolManager', function() {
    describe('createPool', function() {
        it('Adds a pool to the pools tabel.', function() {
            PoolManager.createPool(
                'SomeObjectPool',
                function() {},
                function() {},
                function() {}
            );
            expect(PoolManager._pools.SomeObjectPool instanceof Pool).toBe(true);
        });
        it('Errors if the pool already exists.', function() {
            let createPool = function() {
                PoolManager.createPool(
                    'SomeObjectPool',
                    function() {},
                    function() {},
                    function() {}
                )
            };

            expect(createPool).toThrow();
        });
    });
});