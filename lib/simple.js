var AWS = require('aws-sdk');
var dynargs = require('dynargs');

var Type = dynargs.type;

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
  if (!val) return undefined;
  var result =
    { AttributeName: val[0]
    , AttributeType: val[1]
    };
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

exports.SimpleDynamoDB = SimpleDynamoDB;
