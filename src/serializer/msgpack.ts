import msgpack from 'msgpack5'
import { ArrayOrObject } from '../types'
import Serializer, { SerializerType } from '../serializer'

const mpak = msgpack({ forceFloat64: true })

export class MsgpackSerializer implements Serializer {
    type: SerializerType = SerializerType.MsgPack
    isBinary: boolean = true

    serialize(obj: ArrayOrObject): string {
        return mpak.encode(obj).toString()
    }

    unserialize(payload: string): ArrayOrObject {
        return mpak.decode(Buffer.from(payload))
    }
}

export default new MsgpackSerializer()