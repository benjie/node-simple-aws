Simple DynamoDB
===============

Amazon have released an official [aws-sdk][] module for Node.JS - this
is fantastic! However, interfacing with it is very verbose, so why not
wrap it up?

Usage
=====

```
var SimpleDynamoDB = require('simple-dynamodb')
var ddb = new SimpleDynamoDB()

ddb.getItem(tableName, hashValue, function(err, res){})
```

All methods of ddb are simple wrappers around AWS' official methods,
helping to protect against misspelled object keys/etc. SimpleDynamoDB
uses type inference to figure out your intention, so ensure passed
arguments are of the correct type!

`DynamoDB(options)`
-------------------

Options are passed straight on to the AWS DynamoDB instance - you can
use this to feed in your `accessKeyId`, `secretAccessKey` and `region`.

`ddb.client`
------------

This is the DynamoDB instance from aws-sdk, all other functions are
just wrappers around this.

`ddb.listTables([exclusiveStartTableName,] [limit,] callback)`
--------------------------------------------------------------

`limit` must be a number or `null`.

`ddb.createTable(tableName, hash, [range,] [readThroughput,] [writeThroughput,] callback)`
------------------------------------------------------------------------------------------

`hash` and `range` are 2-tuples (pairs) where the first entry is the
name for the field and the second is the type.
