[![CircleCI](https://circleci.com/gh/lajosbencz/wampc.svg?branch=master&style=shield)](<LINK>)

# wampc
#### Web Application Messaging Protocol Client

## Supported protocols
 - JSON (native) as default
 - CBOR ([cbor-x](https://github.com/kriszyp/cbor-x))
 - MessagePack ([@msgpack/msgpack](https://github.com/msgpack/msgpack-javascript))

## Supported transports
 - WebSocket _(JSON, CBOR, MessagePack)_
 - RawSocket _(only in Node and only JSON)_

## Credits
Most of the implementation details were borrowed from
[AutobahnJS](https://github.com/crossbario/autobahn-js)
and
[WampyJS](https://github.com/KSDaemon/wampy.js)
