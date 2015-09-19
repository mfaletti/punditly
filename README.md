## Punditly
Share fan-sourced commentary

### Setup

You can use [node.js](http://nodejs.org) to run a static file server for local development/testing or use Charles Proxy to map to a local directory

### Building

* Install node.js
* Install grunt-cli with `npm install -g grunt-cli`
* Install build dependencies with `npm install`
* Run `grunt build` for a build package or 'grunt dist' for a distribution package

## Folder structure
|-- app
|   |-- controllers
|   |-- models
|   |-- views
|    -- mobile
|       |-- controllers
|       |-- models
|       |-- views
 -- config
 -- lib
 -- tests