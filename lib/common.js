var AWS = require('aws-sdk');

function parseOptions(options) {
  if (!options) options = {};
  if (!options.region) options.region = 'us-east-1';
  if (!options.credentials && options.accessKeyId && options.secretAccessKey) {
    // Work around bug in aws-sdk.
    options.credentials = new AWS.Credentials(options.accessKeyId, options.secretAccessKey);
  }
  return options;
}

exports.parseOptions = parseOptions;
