[![npm version](https://badge.fury.io/js/router5.svg)](http://badge.fury.io/js/router5)
[![Build Status](https://travis-ci.org/router5/router5.svg)](https://travis-ci.org/router5/router5)
[![Coverage Status](https://coveralls.io/repos/router5/router5/badge.svg)](https://coveralls.io/r/router5/router5)

# router5

Official website: [router5.github.io](http://router5.github.io)

> This library is in release candidate version. Although it is functional, fully tested and stable,
API is subject to adjustments whithout notice.

A simple but powerful HTML5 router, based on [route-node](https://github.com/troch/route-node)
and [path-parser](https://github.com/troch/path-parser).

## What is it?

It is an __HTML5 router__, using history and organising __named routes__ in a __tree__. Browser support
is limited to modern browsers implementing session history: [http://caniuse.com/#search=history](http://caniuse.com/#search=history).

Router 5 supports use of hash in URL, but session history is still required: deciding
to use a hash or not is therefore not a decision based on browser support, but rather a decision based
on server capabilities!

It is aimed at applications rendering a tree of components, but can easily be used elsewhere.
This router is library and framework agnostic, and makes no asumption on your implementation.
It favours __convention over configuration__, by giving you the means to observe route changes
and to react to them. Afterall, why treat route changes any different than data changes?

You can read more about motivations behind it here: [Why router5?](http://router5.github.io/docs/why-router5.html).

To get started, look here: [Get started](http://router5.github.io/docs/why-router5.html)

## Features

- __Use of hash (#)__
- __Default start route__: a default route to navigate to on load if the current URL doesn't match any route. Similar to `$routeProvider.otherwise()` in _Angular ngRoute_ module.
- __Start__ and __stop__ router
- __Nested named routes__: routes are identified by names and parameters so you don't have to manipulate URLs
directly. Routes can be nested, introducing the notion of _route segments_.
- __Route change listeners: listen to any route change, or register listeners for a specific route.
- __Route node change listeners__: you can add listeners to be triggered on a specific named route node. They will be triggered if that named route node is the node a component tree needs to be re-rendered from.
- __Segments deactivation__: you can register segment components. On a route change, it will ask those components through their `canDeactivate` method if they allow navigation. Similar to _Angular 2_ and _Aurelia_ routers.
- __You are in control!__ You decide what to do on a route change and how to do it.


## Guides

- [Configuring routes](http://router5.github.io/docs/configuring-routes.html)
- [Path syntax](http://router5.github.io/docs/path-syntax.html)
- [Navigation](http://router5.github.io/docs/navigation.html)
- [Listeners](http://router5.github.io/docs/listeners.html)
- [Preventing navigation](http://router5.github.io/docs/api-reference.html)

## API

- [API Reference](http://router5.github.io/docs/preventing-navigation.html)

## Examples

- [With React](http://router5.github.io/docs/with-react.html)

## Related

- [route-node](https://github.com/troch/route-node)
- [router5-react](https://github.com/router5/router5-react)
