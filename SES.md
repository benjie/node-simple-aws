Simple SES
==========

This class implements a thin wrapper around the
[SES](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SES.html)
class of [AWS' official SDK for NodeJS][aws-sdk].

SES(options)
------------

Options are passed straight on to the AWS SQS Client instance - you can
use this to feed in your `accessKeyId`, `secretAccessKey` and `region`.

ses.client
----------

This is the SES Client instance from [aws-sdk][], all other functions
are just wrappers around this.

    [ ['from', Type.email]
    , ['to', Type.oneOf(Type.email, Type.arrayOf(Type.email), Type.arrayOf(Type.arrayOf(Type.email)))]
    , ['subject', Type.string]
    , ['bodyText', Type.string]
    , ['bodyHTML', Type.optional(Type.stringNotEmail)]
    , ['replyTo', Type.optional(Type.oneOf(Type.email,Type.arrayOf(Type.email))]
    , ['returnPath', Type.optional(Type.email)]
    , ['callback', Type.fn]
ses.sendEmail(from, to, subject, bodyText, [bodyHTML,] [replyTo,] [returnPath,] callback)
-----------------------------------------------------------------------------------------

`to` can be either: an email address, an array of email addresses (all
To:) or an array of arrays of email addresses, where the first is the
To addresses, second CC and third BCC.

```
to = "example@example.com";
to = ["example@example.com", "example2@example.com"];
to =
  [ [ "to1@example.com"
    , "to2@example.com"
    ]
  , [ /* no CCs */]
  , [ "bcc1@example.com"
    , "bcc2@example.com"
    ]
  ];
```

`bodyHTML` must not take the form of an email address
(`/^[^@]+@[^@]+\.[^@]+$/`).

`replyTo` is either an email address or an array of email addresses.

[aws-sdk]: http://aws.amazon.com/sdkfornodejs/
