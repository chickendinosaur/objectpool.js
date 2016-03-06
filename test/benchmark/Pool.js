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

const objectPool = new Pool(
    allocatorCallback,
    renewObjectCallback, {}
);

let obj = objectPool.create('created');
objectPool.put(new PooledObject());
objectPool.put(new PooledObject());

suite
    .add('Pool#create#put get', function() {
        objectPool.put(objectPool.create());
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

