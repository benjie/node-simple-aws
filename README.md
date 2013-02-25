Simple DynamoDB
===============

Amazon have released an official [aws-sdk][] module for Node.JS - this
is fantastic! However, interfacing with it is very verbose, so why not
wrap it up?

Stability
=========

**UNSTABLE**: Haven't even implemented a test suite yet - please do
feel free to jump in and submit one!

Usage
=====

```
var SimpleDynamoDB = require('simple-dynamodb')
var ddb = new SimpleDynamoDB()

ddb.getItem(tableName, hashValue, function(err, res, item){})
```

All methods of ddb are simple wrappers around AWS' official methods,
helping to protect against misspelled object keys/etc. SimpleDynamoDB
uses type inference to figure out your intention, so ensure passed
arguments are of the correct type!

DynamoDB(options)
-------------------

Options are passed straight on to the AWS DynamoDB instance - you can
use this to feed in your `accessKeyId`, `secretAccessKey` and `region`.

ddb.client
------------

This is the DynamoDB instance from aws-sdk, all other functions are
just wrappers around this.

ddb.listTables([exclusiveStartTableName,] [limit,] callback)
--------------------------------------------------------------

`limit` must be a number or `null`.

ddb.createTable(tableName, hash, [range,] [readThroughput,] [writeThroughput,] callback)
------------------------------------------------------------------------------------------

`hash` and `range` are 2-tuples (pairs) where the first entry is the
name for the field and the second is the type.

ddb.getItem(tableName, hashValue, [rangeValue,] [attributesToGet,] [consistentRead,] callback)
------------------------------------------------------------------------------------------------

`attributesToGet` is an array of attribute names (strings).

`consistentRead` is a boolean.

`callback` arguments: (err, res, item)

ddb.putItem(tableName, item, [expected,] [returnValues,] callback)
--------------------------------------------------------------------

`item` is a simple JSON object of Attribute:Value.

`expected` is an object where the keys are the attribute names, and the
values are either `false` (to say you expect it not to exist) or the
value you expect.

Example:

```
expected =
  { nonExistant: false
  , equalsThree: 3
  , helloWorld: "HelloWorld"
  }
```

`returnValues` is a string: either `NONE` or `ALL_OLD`

ddb.batchGetItem(itemsToGet, callback)
----------------------------------------

`itemsToGet` is an object where the keys are the table names and the
values are an array of either hash values or 2-tuples (pairs) of [hash,
range] values.

Example:

```
ddb.batchGetItem(
  { MyTable:
    [ [1, 1]
    , [1, 3]
    , [5, 92]
    ]
  , MyOtherTable:
    [ "Key1"
    , "Key3"
    , "Key99"
    ]
  }, function(err, res) { /* ... */ });
```

`callback` arguments: (err, res, items) where items takes the form
{TableName: [entry, entry, entry]}

ddb.batchWriteItem(itemsToPut, itemsToDelete, callback)
------------------------------------------

`itemsToPut`: map of table to items to add to said table. Items are
simple JS objects.

`itemsToPut`: map of table to keys to delete from said table. Keys are
either the hash values or 2-tuples (pairs) of [hash, range] values.

This method automatically re-attempts to write the UnprocessedItems 3
times, saving you effort.

ddb.deleteItem(tableName, hash, [range,] [expected,] [returnValues,] callback)
--------------------------------------------------------------------------------

See `putItem` above for `expected`/`returnValues`.

ddb.query(tableName, hashValue, [rangeKeyCondition,] [attributesToGet,] [limit,] [consistentRead,])
--------------------------------------------------------------------------------------------------------------------------

Doesn't support `ScanIndexForward:false`.

`rangeKeyCondition` takes the form: `[comparison, value, value2]` where
`value2` is only required when comparison is `BETWEEN`. SimpleDynamoDB
automatically translates the standard comparison operators `<`, `>`,
`<=`, `>=`, `=`, `==`, `===` and passes other values straight through
to AWS' implementation.

Examples:
 - `rangeKeyCondition = [">", 27]`
 - `rangeKeyCondition = ["GT", 27]`
 - `rangeKeyCondition = ["BETWEEN", 27, 99]`

`attributesToGet` is a simple array of the attribute names you wish to
fetch.

`callback` arguments: (err, res, items) where items takes the form
[entry, entry, entry]

ddb.queryCount(tableName, hashValue, [rangeKeyCondition,] [limit,] [consistentRead,])
------------------------------------------------------------------------------------------------------------
As above, but results in the number of matched records and not the
records themselves.

`callback` arguments: (err, res, count).
