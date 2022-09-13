import msgpack from 'msgpack5'
import { ArrayOrObject } from '../types'
import Serializer, { SerializerType } from '../serializer'

const mpak = msgpack({ forceFloat64: true })

export class MsgpackSerializer implements Serializer {
    type: SerializerType = SerializerType.MsgPack
    isBinary: boolean = true

    serialize(obj: ArrayOrObject): string {
        try {
            // @ts-ignore
            return mpak.encode(obj)
        } catch (e) {
            console.error('MessagePack encoding error', e)
            throw e
        }
    }

    unserialize(payload: string): ArrayOrObject {
        try {
            return mpak.decode(Buffer.from(payload))
        } catch (e) {
            console.error('MessagePack decoding error', e)
            throw e
        }
    }
}

export default new MsgpackSerializer()
