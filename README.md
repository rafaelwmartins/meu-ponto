Meu Ponto [![Build Status](https://travis-ci.org/rafaelwmartins/meu-ponto.svg?branch=master)](https://travis-ci.org/rafaelwmartins/meu-ponto)
=========
Meu Ponto is a personal time clock for employees. It provides an easy way to keep track of time and attendance using a Facebook account for user login.

Please note that Meu Ponto handles entries considering the Brazilian laws and it is currently only available in Portuguese.

Technical details
-----------------
Meu Ponto is a simple single page responsive application built using [AngularJS] and a [Firebase] backend. It relies on [AngularFire] for easy data bindings. It uses [Bootstrap] for the layout and [Moment.js] to manipulate dates.

Development
-----------
If you want to build and run Meu Ponto yourself, you'll need [node.js]:

```bash
npm install
```

Use `grunt` to build the code:

```bash
grunt build[:minify] [--dest] [--firebase]
```

**Example** (builds into `./your-dir/` using `https://your-firebase.firebaseio.com/` Firebase *without* minifying):

```bash
grunt build:0 --dest your-dir --firebase https://your-firebase.firebaseio.com/
```

Tests
-----
Meu Ponto uses [Jasmine] and [Karma] for unit tests. To run the tests, and then watch the files for changes:

```bash
npm test
```

To rerun the tests, just change any of the source or test files.

License
-------
Meu Ponto is freely distributable under the terms of the MIT license.

[AngularJS]: http://angularjs.org
[Firebase]: http://www.firebase.com
[AngularFire]: http://angularfire.com
[Bootstrap]: http://getbootstrap.com
[Moment.js]: http://momentjs.com
[node.js]: http://nodejs.org
[Jasmine]: http://jasmine.github.io
[Karma]: http://karma-runner.github.io
