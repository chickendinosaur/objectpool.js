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

    this.arr = this.arr || [];
    this.b = this.b || {};
}

PooledObject.prototype = {
    constructor: PooledObject,
    init: function(name) {
        this._name = name;

        return this;
    },
    dispose: function() {
        this._name = 'disposed';
    }
};

var allocatorCallback = function(name) {
    return new PooledObject(name);
};
var renewObjectCallback = function(name) {
    return this.get().init(name);
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
//objectPool.destroy(new PooledObject());

suite
    .add('Pool', function() {
        obj=objectPool.create();
        objectPool.destroy(obj);
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
