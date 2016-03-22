'use strict';

const path = require('path');
const Pool = require(path.join('..', '..', 'dist', 'PoolManager.js')).default;

describe('PoolManager', function() {
    describe('addPool', function() {
        it('Errors if the pool already exists.', function() {
            expect(0).toBe(0);
        });
        it('Adds a pool to the pools tabel.', function() {
            expect(0).toBe(0);
        });
    });

    describe('createPool', function() {
        it('Returns a new pool.', function() {
            expect(0).toBe(0);
        });
    });
});