# Description  

Creates and maintains a collection of an objects for reuse.

## The Problem

The reason behind this project as well as what I see as other people's attempts at object pooling in JavaScript is my infatuation with smooth framerate and speed which can be interrupted by the garbage collector due to thrashing. As I began my search for pooling libraries the implementation of the ones I evaluated were either tightly coupled to the object itself, required a strict way to define how the object is disposed, belonged as part of a game library, was very minimal with no tracking support, or seemed like there had to be a way to increase the creation/resuse speed. There had to be a better way to enable a completely agnostic approach.

## Approach

1) Maintain a completely agnostic approach to be used with anything.

2) Simple usage api.

3) Reuse objects as fast as possible within reason of the complexity of the other points.

4) Encorporate full debugging functionality, including when an object is created using the 'new' keyword without the pool while holding true to #1. This one really opened my eyes to the full power of JavaScript.

5) Ability to create and destroy pools across the application. Object pool of object pools? What the... This would be for gaming applications in a real world scenario. The functionality will be there to allow for lengthy games to free up unused allocated memory ex. level changes or application section changes where those object type are no longer used.

## Conclusion

Throughout the process of getting to a base api while maintaining the key points laid out here my knowledge of the inner workings of JavaScript as well as more fluent ways to approach creating objects has grown ten-fold. A lot of gears were broken and .js files were harmed during the making of this project. If you learned something useful or happen like this project feel free to throw me a star to show your appreciation. Thank you!

See Usage below for examples.

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
