var AWS = require('aws-sdk');
var dynargs = require('dynargs');

var Type = dynargs.type;

Type.key = Type.oneOf(Type.string, Type.number, Type.buffer)

function CamelCase(key) {
  return key.substr(0,1).toUpperCase()+key.substr(1);
}

function parsed2params(parsed) {
  var result = {};
  for (var key in parsed) {
    if (parsed.hasOwnProperty(key)) {
      if (key !== 'callback') {
        result[CamelCase(key)] = parsed[key];
      }
    }
  }
  return result;
}

function attributeNameType(val) {
  if (!val) return;
  var result =
    { AttributeName: val[0]
    , AttributeType: val[1]
    };
  return result;
}

function keyElement(val) {
  if (typeof val === 'string') {
    return {"S":val};
  } else if (typeof val === 'number') {
    return {"N":""+val};
  } else if (Buffer.isBuffer(val)) {
    return {"B":val.toString('base64')};
  } else if (typeof val === 'undefined') {
    return;
  } else {
    throw new Error("Type of key with value '"+val+"' cannot be discerned.");
  }
}

function parseValue(obj) {
  var val;
  if (obj.S) {
    val = obj.S;
  } else if (obj.N) {
    // XXX: handle isNaN
    val = parseFloat(obj.N);
  } else if (obj.B) {
    val = new Buffer(obj.B, 'base64');
  } else if (obj.SS) {
    val = obj.SS;
  } else if (obj.NS) {
    val = [];
    for (var i = 0, l = obj.NS.length; i < l; i++) {
      // XXX: handle isNaN
      val.push(parseFloat(obj.NS[i]));
    }
  } else if (obj.BS) {
    val = [];
    for (var i = 0, l = obj.NS.length; i < l; i++) {
      val.push(new Buffer(obj.BS[i], 'base64'));
    }
  } else {
    throw new Error("Cannot process type '"+Object.keys(obj)+"'");
  }
  return val;
}

function parseObject(item) {
  if (!item) {
    return;
  }
  var result = {};
  for (var k in item) {
    if (item.hasOwnProperty(k)) {
      result[k] = parseValue(item[k]);
    }
  }
  return result;
}

function formatValue(val) {
  if (Type.string(val)) {
    return {S: val};
  } else if (Type.number(val)) {
    return {N: ""+val};
  } else if (Type.buffer(val)) {
    return {B: val.toString('base64')};
  } else if (Type.arrayOf(Type.string)) {
    return {SS: val};
  } else if (Type.arrayOf(Type.number)) {
    var vals = [];
    for (var i = 0, l = val.length; i < l; i++) {
      vals.push(""+val[i]);
    }
    return {NS: vals};
  } else if (Type.arrayOf(Type.buffer)) {
    var vals = [];
    for (var i = 0, l = val.length; i < l; i++) {
      vals.push(val[i].toString('base64'));
    }
    return {BS: vals};
  } else {
    throw new Error("Couldn't format value '"+val+"'");
  }
}

function formatObject(obj) {
  if (!obj) {
    return;
  }
  var result = {};
  for (var k in obj) {
    if (obj.hasOwnProperty(k)) {
      result[k] = formatValue(obj[k]);
    }
  }
  return result;
}

function formatExpected(expected) {
  if (!expected) {
    return;
  }
  var result = {};
  for (var k in expected) {
    if (expected.hasOwnProperty(k)) {
      if (expected[k] === false) {
        result[k] = {Exists: false};
      } else {
        result[k] = {Value: formatValue(expected[k])};
      }
    }
  }
  return result;
}

function formatKey(parsed) {
  var result = {};
  result.HashKeyElement = keyElement(parsed.hash);
  if (parsed.range) {
    result.RangeKeyElement = keyElement(parsed.range);
  }
  return result;
}

function SimpleDynamoDB(options) {
  if (!options) options = {};
  if (!options.region) options.region = 'us-east-1';
  if (!options.credentials && options.accessKeyId && options.secretAccessKey) {
    // Work around bug in aws-sdk.
    options.credentials = new AWS.Credentials(options.accessKeyId, options.secretAccessKey);
  }
  this.client = new AWS.DynamoDB.Client(options);
}

SimpleDynamoDB.prototype.listTables = function listTables() {
  var spec =
    [ ['exclusiveStartTableName', Type.optional(Type.string)]
    , ['limit', Type.optional(Type.number)]
    , ['callback', Type.fn]
    ];
  var parsed = dynargs.parse(arguments, spec);
  var params = parsed2params(parsed);
  function callback(err, data) {
    var tableNames;
    if (!err) tableNames = data.TableNames;
    return parsed.callback(err, data, tableNames);
  }
  this.client.listTables(params, callback);
}

SimpleDynamoDB.prototype.createTable = function createTable() {
  var spec =
    [ ['tableName', Type.string]
    , ['hash', Type.arrayOf(Type.string)]
    , ['range', Type.optional(Type.arrayOf(Type.string))]
    , ['throughputRead', Type.optional(Type.number)]
    , ['throughputWrite', Type.optional(Type.number)]
    , ['callback', Type.fn]
    ];
  var parsed = dynargs.parse(arguments, spec);
  var readCapacity = spec.throughputRead || 1;
  var writeCapacity = spec.throughputWrite || readCapacity;
  var params =
    { TableName: parsed.tableName
    , KeySchema:
      { HashKeyElement: attributeNameType(parsed.hash)
      , RangeKeyElement: attributeNameType(parsed.range)
      }
    , ProvisionedThroughput:
      { ReadCapacityUnits: readCapacity
      , WriteCapacityUnits: writeCapacity
      }
    };
  this.client.createTable(params, parsed.callback);
}

SimpleDynamoDB.prototype.getItem = function getItem() {
  var spec =
    [ ['tableName', Type.string]
    , ['hash', Type.key]
    , ['range', Type.optional(Type.key)]
    , ['attributesToGet', Type.optional(Type.arrayOf(Type.string))]
    , ['consistentRead', Type.optional(Type.boolean)]
    , ['callback', Type.fn]
    ];
  var parsed = dynargs.parse(arguments, spec);
  var params =
    { TableName: parsed.tableName
    , Key: formatKey(parsed)
    , AttributesToGet: parsed.attributesToGet
    , ConsistentRead: parsed.consistentRead
    };
  function callback(err, res) {
    var item;
    if (!err) {
      item = parseObject(res.Item);
    }
    return parsed.callback(err, res, item);
  }
  this.client.getItem(params, callback);
}

SimpleDynamoDB.prototype.putItem = function putItem() {
  var spec =
    [ ['tableName', Type.string]
    , ['item', Type.object]
    , ['expected', Type.optional(Type.object)]
    , ['returnValues', Type.optional(Type.string)]
    , ['callback', Type.fn]
    ];
  var parsed = dynargs.parse(arguments, spec);
  var params =
    { TableName: parsed.tableName
    , Item: formatObject(parsed.item)
    , Expected: formatExpected(parsed.expected)
    , ReturnValues: parsed.returnValues
    };
  this.client.putItem(params, parsed.callback);
}

SimpleDynamoDB.prototype.deleteItem = function deleteItem() {
  var spec =
    [ ['tableName', Type.string]
    , ['hash', Type.key]
    , ['range', Type.optional(Type.key)]
    , ['expected', Type.optional(Type.object)]
    , ['returnValues', Type.optional(Type.string)]
    , ['callback', Type.fn]
    ];
  var parsed = dynargs.parse(arguments, spec);
  var params =
    { TableName: parsed.tableName
    , Key: formatKey(parsed)
    , Expected: formatExpected(parsed.expected)
    , ReturnValues: parsed.returnValues
    };
  this.client.deleteItem(params, parsed.callback);
}

exports.SimpleDynamoDB = SimpleDynamoDB;
