var AWS = require('aws-sdk');
var dynargs = require('dynargs');
var common = require('./common');

function SimpleSQS(options) {
  options = common.parseOptions(options);
  this.client = new AWS.SQS.Client(options);
  return this;
}

SimpleSQS.prototype.getQueueUrl = function getQueueUrl() {
  var spec =
    [ ['name', Type.string]
    , ['ownerId', Type.optional(Type.string)]
    , ['callback', Type.fn]
    ];
  var parsed = dynargs.parse(arguments, spec);
  var params =
    { QueueName: parsed.name
    , QueueOwnerAWSAccountId: parsed.ownerId
    };
  function callback(err, res) {
    var queueUrl;
    if (!err) {
      queueUrl = res.QueueUrl;
    }
    parsed.callback(err, res, queueUrl);
  }
  this.client.getQueueUrl(params, callback);
}

SimpleSQS.prototype.sendMessage = function sendMessage() {
  var spec =
    [ ['queue', Type.string]
    , ['message', Type.string]
    , ['delay', Type.optional(Type.number)]
    , ['callback', Type.fn]
    ];
  var parsed = dynargs.parse(arguments, spec);
  var params =
    { QueueUrl: parsed.queue
    , MessageBody: parsed.message
    , DelaySeconds: parsed.delay
    };
  this.client.sendMessage(params, parsed.callback);
}

SimpleSQS.prototype.sendMessageBatch = function sendBatchMessage() {
  var spec =
    [ ['queue', Type.string]
    , ['messages', Type.objectOf(Type.oneOf(Type.arrayOf(Type.string), Type.objectOf(Type.string)))]
    , ['delay', Type.optional(Type.oneOf(Type.arrayOf(Type.number), Type.objectOf(Type.number)))]
    , ['callback', Type.fn]
    ];
  var parsed = dynargs.parse(arguments, spec);
  if (!parsed.delay) parsed.delay = {};
  var entries = [];
  for (var key in parsed.messages) {
    if (parsed.messages.hasOwnProperty(key)) {
      key = ""+key; // Just in case parsed.messages is an array
      var entry =
        { Id: key
        , MessageBody: parsed.messages[key]
        , DelaySeconds: parsed.delay[key]
        };
      entries.push(entry);
    }
  }
  var params =
    { QueueUrl: parsed.queue
    , Entries: entries
    };
  this.client.sendBatchMessage(params, parsed.callback);
}

SimpleSQS.prototype.deleteMessage = function deleteMessage() {
  var spec =
    [ ['queue', Type.string]
    , ['receiptHandle', Type.string]
    , ['callback', Type.fn]
    ];
  var parsed = dynargs.parse(arguments, spec);
  var params =
    { QueueUrl: parsed.queue
    , ReceiptHandle: parsed.receiptHandle
    };
  this.client.deleteMessage(params, parsed.callback);
}

SimpleSQS.prototype.receiveMessage = function receiveMessage() {
  var spec =
    [ ['queue', Type.string]
    , ['attributeNames', Type.optional(Type.arrayOf(Type.string))]
    , ['maxNumberOfMessages', Type.optional(Type.number)]
    , ['waitTimeSeconds', Type.optional(Type.number)]
    , ['visibilityTimeout', Type.optional(Type.number)]
    , ['callback', Type.fn]
    ];
  var parsed = dynargs.parse(arguments, spec);
  var params =
    { QueueUrl: parsed.queue
    , AttributeNames: parsed.attributeNames
    , MaxNumberOfMessages: parsed.maxNumberOfMessages
    , WaitTimeSeconds: parsed.waitTimeSeconds
    , VisibilityTimeout: parsed.visibilityTimeout
    };
  this.client.receiveMessage(params, parsed.callback);
}

module.exports = SimpleSQS;
