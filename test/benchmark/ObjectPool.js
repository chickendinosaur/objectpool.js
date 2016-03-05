'use strict';

const Benchmark = require('benchmark');
const suite = new Benchmark.Suite;
const path = require('path');

const ObjectPool = require(path.join('..', '..', 'dist', 'ObjectPool')).default;

/*
Setup
 */

function TestClass(name) {
    this._name = name || 'Name';
    this.arr = [];
    this.b = {};
}
TestClass.prototype = {
    init: function(name) {
        this._name = name;
    },
    release: function() {
        this._name = '';
    }
};

function create() {
    new TestClass('me');
}

function creationCallback() {
    return new TestClass();
};

const objectPool = new ObjectPool(creationCallback, {
    poolSize: 10,
    minPoolSize: 0,
    maxPoolsize: -1
});

let obj;
const pool = objectPool._pool;

// add tests 
suite
    .add('Pool#get and put', function() {
        obj = objectPool.get();
        objectPool.put(obj);
    })
    .add('Native#new', function() {
        new TestClass();
    })
    // add listeners 
    .on('cycle', function(event) {
        console.log(String(event.target));
    })
    .on('complete', function() {
        console.log('Fastest is ' + this.filter('fastest').map('name'));
    })
    // run async 
    .run({ 'async': true });
