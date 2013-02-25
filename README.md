Simple AWS
===============

Amazon have released an official [aws-sdk][] module for Node.JS - this
is fantastic! However, interfacing with it is very verbose. This module
is an attempt to wrap the AWS library up in very thin wrapper functions
to make it easier to interface with.

Stability
---------

**UNSTABLE**: Haven't even implemented a test suite yet - please do
feel free to jump in and submit one!

Usage
-----

```
var simpleAWS = require('simple-aws');
var ddb = new simpleAWS.DynamoDB();

ddb.getItem(tableName, hashValue, function(err, res, item){});
```

All methods of ddb are simple wrappers around AWS' official methods,
helping to protect against misspelled object keys/etc. It uses type
inference to figure out your intention, so ensure passed arguments are
of the correct type!

Dynamic argument lists are parsed using the very simple [dynargs][]
library.

Supported APIs
--------------

 * [DynamoDB](DynamoDB.md) - 8 methods supported
 * [SQS](SQS.md) - 5 methods supported

Contributions
-------------

The wrapper functions are very simple, so if an API you need is missing
feel free to implement it yourself and submit a pull request.

There's no test suite yet - if you fancy making one that would be much
appreciated!

License
-------

[MIT license](http://benjie.mit-license.org/)
