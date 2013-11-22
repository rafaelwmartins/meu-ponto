Meu Ponto
=========
Meu Ponto provides an easy way to manage working hours using a Facebook account.

Please note that Meu Ponto handles entries considering the Brazilian laws and it is currently only available in Portuguese.

Technical details
-----------------
Meu Ponto is a simple single page application built using [AngularJS](http://angularjs.org) and a [Firebase](http://www.firebase.com) backend. It relies on [AngularFire](http://angularfire.com) for easy data bindings. It uses [Bootstrap](http://getbootstrap.com) for the layout and [Moment.js](http://momentjs.com) to manipulate dates.

Development
-----------
If you want to build and run Meu Ponto yourself, you'll need [node.js](http://nodejs.org):

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

License
-------
Meu Ponto is freely distributable under the terms of the MIT license.
