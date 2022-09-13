import { encode, decode } from 'cbor-x'
import { ArrayOrObject } from '../types'
import Serializer, { SerializerType } from '../serializer'

export class CborSerializer implements Serializer {
    type: SerializerType = SerializerType.Cbor
    isBinary: boolean = true

    serialize(obj: ArrayOrObject): string {
        return encode(obj).toString()
    }

    unserialize(payload: string): ArrayOrObject {
        return decode(Buffer.from(payload))
    }
}

export default new CborSerializer()
