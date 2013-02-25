Simple SQS
==========

This class implements a thin wrapper around the
[SQS](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SQS.html)
class of [AWS' official SDK for NodeJS][aws-sdk].

SQS(options)
------------

Options are passed straight on to the AWS SQS Client instance - you can
use this to feed in your `accessKeyId`, `secretAccessKey` and `region`.

sqs.client
----------

This is the SQS Client instance from [aws-sdk][], all other functions
are just wrappers around this.

sqs.getQueueUrl(name, [ownerId,] callback)
------------------------------------------

`name` is the name of the queue.

`ownerId` is the AWS account ID of the person who owns this queue.

`callback` parameters are: (err, res, queueUrl)

sqs.sendMessage(queueUrl, message, [delay,] callback)
-----------------------------------------------------

sqs.sendMessageBatch(queueUrl, messages, [delays,] callback)
------------------------------------------------------------

`messages` can either be an array of message (in which case we generate
IDs based on the array index of the message) or an object in which case
the values are the messages and the keys are used as the IDs.

`delays` is the same as `messages` except the values are numbers
representing the delay in **seconds**.

sqs.deleteMessage(queueUrl, messageHandle, callback)
----------------------------------------------------

sqs.receiveMessage(queueUrl, [attributeNames,] [maxNumberOfMessages,] [waitTimeInSeconds,] [visibilityTimeout,] callback)
-------------------------------------------------------------------------------------------------------------------------

`attributeNames`:
>  A list of attributes that need to be returned along with each message. The set of valid attributes are [SenderId, ApproximateFirstReceiveTimestamp, ApproximateReceiveCount, SentTimestamp].

Since `maxNumberOfMessages`, `waitTimeInSeconds` and
`visibilityTimeout` are all numbers you should specify them from left
to right (i.e. you cannot omit `waitTimeInSeconds` if you want to specify
`visibilityTimeout`). Any parameters you wish to leave as their default
value simply pass `undefined` (**NOT** null).
