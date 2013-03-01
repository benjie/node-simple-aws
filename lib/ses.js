var AWS = require('aws-sdk');
var dynargs = require('dynargs');
var common = require('./common');

var Type = dynargs.type;

Type.email = function isEmail(val) {
  if (!Type.string(val)) return false;
  return /^[^@]+@[^@]+\.[^@]+$/.test(val);
}

Type.stringNotEmail = function isStringNotEmail(val) {
  return Type.string(val) && !Type.email(val);
}

function tidy(json) {
  return JSON.parse(JSON.stringify(json));
}

function SimpleSES(options) {
  options = common.parseOptions(options);
  this.client = new AWS.SES(options).client;
  return this;
}

SimpleSES.prototype.sendEmail = function sendEmail() {
  var spec =
    [ ['from', Type.email]
    , ['to', Type.oneOf(Type.email, Type.arrayOf(Type.email), Type.arrayOf(Type.arrayOf(Type.email)))]
    , ['subject', Type.string]
    , ['bodyText', Type.string]
    , ['bodyHTML', Type.optional(Type.stringNotEmail)]
    , ['replyTo', Type.optional(Type.oneOf(Type.email,Type.arrayOf(Type.email)))]
    , ['returnPath', Type.optional(Type.email)]
    , ['callback', Type.fn]
    ];
  var parsed = dynargs.parse(arguments, spec);

  if (Type.email(parsed.to)) {
    parsed.to = [[parsed.to]];
  } else if (Type.arrayOf(Type.email)(parsed.to)) {
    parsed.to = [parsed.to];
  }

  if (Type.email(parsed.replyTo)) {
    parsed.replyTo = [parsed.replyTo];
  }

  var params = tidy(
    { Source: parsed.from
    , Destination:
      { ToAddresses: parsed.to[0]
      , CcAddresses: parsed.to[1]
      , BccAddresses: parsed.to[2]
      }
    , Message:
      { Subject:
        { Data: parsed.subject
        }
      , Body:
        { Text:
          { Data: parsed.bodyText
          }
        , Html:
          { Data: parsed.bodyHTML
          }
        }
      }
    , ReplyToAddresses: parsed.replyTo
    , ReturnPath: parsed.returnPath
    });
  this.client.sendEmail(params, parsed.callback);
}

module.exports = SimpleSES;
