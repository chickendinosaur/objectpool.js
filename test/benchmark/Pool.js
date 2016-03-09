'use strict';

const Benchmark = require('benchmark');
const suite = new Benchmark.Suite;
const path = require('path');

const Pool = require(path.join('..', '..', 'dist', 'Pool')).default;

/*
Setup
 */

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
    obj.dispose();
};

const objectPool = new Pool(
    allocatorCallback,
    renewObjectCallback,
    disposeObjectCallback, {}
);

const objectPoolLight = new Pool(
    allocatorCallback,
    renewObjectCallback,
    null, {}
);

objectPool.destroy(new PooledObject());

suite
    .add('Pooled', function() {
        objectPool.destroy(objectPool.create('obj'));
    })
    .add('Pooled', function() {
        objectPoolLight.destroy(objectPoolLight.create('obj'));
    })
    .add('new', function() {
        new PooledObject(null);
    })
    .on('cycle', function(event) {
        console.log(String(event.target));
    })
    .on('complete', function() {
        console.log('Fastest is ' + this.filter('fastest').map('name'));
    })
    // run async 
    .run({});
