'use strict';

const path = require('path');
const ArrayLiteralPool = require(
    path.join('..', '..', '..', 'dist', 'Pools', 'ArrayLiteralPool.js')
).default;
const Pool = require(path.join('..', '..', '..', 'dist', 'Pool.js')).default;

describe('ArrayLiteralPool', function() {
    it('Is a Pool', function() {
        expect(ArrayLiteralPool instanceof Pool).toBe(true);
    });
});