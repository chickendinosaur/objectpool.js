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

    this.arr = this.arr || [];
    this.b = this.b || {};
}

PooledObject.prototype = {
    init: function(name) {
        this._name = name;
    },
    constructor: PooledObject,
    dispose: function() {
        this._name = '';
    }
};

var allocatorCallback = function(name) {
    return new PooledObject(name);
};

var renewObjectCallback = function(name) {
    return this.get().constructor(name);
};

var disposeObjectCallback = function(obj) {
    obj._disposed = true;
};

const objectPool = new Pool(
    allocatorCallback,
    renewObjectCallback,
    disposeObjectCallback, {
        size: 0,
        tracing: false
    }
);

//let obj = objectPool.create('created');
//objectPool.put(new PooledObject());

suite
    .add('Pool#create#put get', function() {
        objectPool.create();
    })
    // .add('new', function() {
    //     new PooledObject(null);
    // })
    .on('cycle', function(event) {
        console.log(String(event.target));
    })
    .on('complete', function() {
        console.log('Fastest is ' + this.filter('fastest').map('name'));
    })
    // run async 
    .run({});
