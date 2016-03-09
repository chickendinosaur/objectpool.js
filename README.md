NOTE: Currently still in early stages of mapping out the project. A lot may change from the current state.

# Description  

Creates and maintains a collection of an objects for reuse.

## The Problem

The reason behind this project as well as what I see as other people's attempts at object pooling in the realm of JavaScript is the infatuation with smooth framerate which can be interrupted by the garbage collector due to thrashing. As I began my search for pooling libraries, the implementations of the ones I evaluated were either tightly coupled to the object itself, required a strict way to define how the object is disposed, belonged as part of a game library, or seemed slow on reuse.

## Approach

1) Maintain a completely agnostic approach to be used with anything. No requirement to alter/rewrite the source a class or module to comply with any pool functionality!

2) Simple usage api.

3) Reuse objects as fast as possible within reason of the complexity of the other points.

4) Ability to manage and track pools across the application. Will be able to hot swap debug mode. (Currently not available due to having to move on temporarily)

## Conclusion

The main performance boost I was able to pick up after spinning around and around was to ditch using .apply(this, arguments) which was a light bulb that went off randomly to hot-swap callbacks. The only way to implement full tracking of any object that gets created, event without using the pool, would be to tie the pool directly to the object's source file; although it's a super cool feature (can't tracking array/object literal creation though) it require people to go through hell to implement pooling for objects not contained themselves a.k.a forking + altering. So the end-game method for pool usage that I came up with is to create pool modules and use them in place of the actual object ince the pool module already imports the object dependency.

If you learned something useful or happen like this project feel free to throw me a star to show your appreciation. Stars generate happiness and happiness generates better code. Thank you!

For examples, see Usage below.

---  

# Author  

John Pittman  
john@chickendinosaur.com  

---

# Getting Started  

## Installation

#### npm  

npm install @chickendinosaur/pool  

## Usage

### Pool
```javascript 
// Create a parent class.

class Person {
    constructor(name) {
        this._name = name;
    }

    init(name) {
        this._name = name;
    }

    dispose() {}
}

// Create a child class.

class Gunner extends Person {
    constructor(name) {
        super(name);

        this._gunType = 'Machine Gun';
        this._bullets = [50];
    }

    // Don't forget to call parent's init if there is one.
    init(name) {
        super.init(name);
    }

    dispose() {
        // Dispose parent.
        super.dispose();

        // Reuse the array.
        const bullets = this._bullets;

        let n = bullets.length;

        for (; n > 0;) {
            bullets.pop();

            --n;
        }
    }
}

// Create a GunnerPool.js file.
// Create and export a new pool to contain Gunners.

import Pool from '@chickendinosaur/pool/Pool';
import Gunner from './GunnerPool.js';

export default new Pool(
    function(name) {
        return new Gunner(name);
        // Or set up defaults for generating up front objects when setting the size or just calling create() with no arguments. (not implemented yet)
        // return new Gunner( name || 'Billy Bob');
    },
    function(name) {
        return this.pull().init(name);
    },
    // The dispose callback parameter also accepts null whick will only
    // use the init callback when calling create();
    function(obj) {
        obj.dispose();
    }
);

// Use the pool anywhere.

import GunnerPool from './GunnerPool.js';

let gunner = GunnerPool.create('Crazy Gunner Guy');

GunnerPool.destroy(gunner);

gunner = GunnerPool.create('Another Gunner Guy');
```
---  

## Tips

#### Performance

- Although all of my examples are in ES6 JavaScript, the current transpilation methods greatly affect performance when using classes; especially using 'super'. The performance hit will be invoked in the object's 'constructor', 'init', and 'dispose' so keep this in mind. If you're interested in performance comparison against other object pools please consider comparing apples to apples and use ES6 or ES5 for both.

#### Creating dispose methods

 - The best way I found to make a universal dispose method for most decent implementations of an object pool is to add an 'obj' paramter and then just do an undefined check to use either the 'obj' or 'this'. This will allow for the ability to dispose using the 'obj.dispose()' method as well as being able to hand off the dispose method as a callback to save and extra function call for performance when recycling the object without having to worry about scope.

- If a property is not referencing another 'object' or collection you can avoid having to reset it since most likely it will be getting re-initialized in the init of the object.

- Do not forget to call the parent's dispose method if inheriting from another object. 

```javascript 
dispose(obj) {
    // Efficient access to the object to dispose of.
    const thisRef = obj === undefined ? this : obj;

    // Dispose parent.
    this.super.dispose(thisRef);
}
```

---

# Development  

## Installation  

From the project root:

* npm install
* npm run build

## Commands  

#### Local

npm run:

benchmark, build, clean, compile, help, init, start, test, compress, publish, update, documentation, set-access, set-author, set-description, set-dist, set-global, set-keywords, set-license, set-main, set-name, set-private, set-repository, set-src, set-test, set-version

---  

# License  

The MIT License (MIT)

Copyright (c) 2016 John Pittman

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
