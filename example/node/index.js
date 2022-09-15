/*
 !REQUIRES a router running at ws://localhost:8951
 Launch this example from the project root with node ./example/node/index.js
 */
const {Client, SerializerType} = require("../../dist/index");

async function main() {
    let opts = {}
    opts.serializers = [SerializerType.Json]
    let client = new Client("ws://localhost:8951", 'default', opts)
    //let client = new Client("tcp://localhost:8952", 'default', opts)

    await client.register('test.a', (args, kwArgs) => {
        return { 'foo': 'bar' }
    })

    await client.subscribe('dev.time', async (args, kwArgs) => {
        console.log('dev.time: ', args[0])
        await client.publish('test.b', ['pub'])
    }, { acknowledge: true })

    await client.subscribe('test.b', async (args, kwArgs) => {
        console.log('test.b: ', args[0])
    }, { acknowledge: true })

    const r = async (t, args, kwArgs) => {
        args = args || []
        kwArgs = kwArgs || {}
        const res = await client.call(t, args, kwArgs)
        console.log(t, 'result: ', res)
        return res
    }
    await r('dev.echo', [1, 2, 3], { foo: 'bar' })
    await r('test.a')
}

main()
    // .then(console.log)
    .catch(console.error)
