# Description  

Creates and maintains a collection of an objects for reuse.

## The Problem

The reason behind this project as well as what I see as other people's attempts at object pooling in the realm of JavaScript is the infatuation with smooth framerate and speed which can be interrupted by the garbage collector due to thrashing. As I began my search for pooling libraries, the implementations of the ones I evaluated were either tightly coupled to the object itself, required a strict way to define how the object is disposed, belonged as part of a game library, were very minimal with no tracking support, or seemed like there had to be a way to increase the creation/resuse speed.

## Approach

1) Maintain a completely agnostic approach to be used with anything. No requirement to alter/rewrite the source a class or module to comply with any pool functionality!

2) Simple usage api.

3) Reuse objects as fast as possible within reason of the complexity of the other points.

4) Encorporate full debugging functionality, including when an object is created using the 'new' keyword without the pool while holding true to #1. This one really opened my eyes to the full power of JavaScript.

5) Ability to create and destroy pools across the application. Object pool of object pools? What the... This would be for gaming applications in a real world scenario. The functionality will be there to allow for lengthy games to free up unused allocated memory ex. level changes or application section changes where those object type are no longer used.

## Conclusion

Throughout the process of getting to a base api while maintaining the key points laid out here my knowledge of the inner workings of JavaScript as well as more fluent ways to approach creating objects has grown ten-fold. A lot of gears were broken and .js files were harmed during the making of this project. If you learned something useful or happen like this project feel free to throw me a star to show your appreciation. Thank you!

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
---  

# Best Practices

#### @method dispose

The best way I found to make a universal dispose method for most decent implementations of an object pool is to add an 'obj' paramter and then just do an undefined check to use either the 'obj' or 'this'. This will allow the ability to hand off the dispose method as a callback to save and extra function call for performance when recycling the object.

If a property is not referencing another 'object' or collection you can avoid having to reset it since most likely it will be getting re-initialized in the init of the object.

Do not forget to call the parent's dispose method if inheriting from another object. 

```javascript 
class Person {
    constructor(name) {
        this._name = name;
    }

    init(name) {
        this._name = name;
    }

    dispose(obj) {
        const thisRef = obj === undefined ? this : obj;
    }
}

class Gunner extends Person {
    constructor(name) {
        super(name);

        this._gunType = 'Machine Gun';
        this._bullets = [50];
    }

    dispose(obj) {
        // Dispose parent.
        super.dispose(obj);

        // Efficient access to the object to dispose of.
        const thisRef = obj === undefined ? this : obj;

        // Best way to reuse arrays.
        const bullets = thisRef._bullets;

        let n = bullets.length;

        for (; n > 0;) {
            bullets.pop();

            --n;
        }
    }
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
