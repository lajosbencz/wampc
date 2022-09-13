import { encode, decode } from 'cbor-x'
import { ArrayOrObject } from '../types'
import Serializer, { SerializerType } from '../serializer'

export class CborSerializer implements Serializer {
    type: SerializerType = SerializerType.Cbor
    isBinary: boolean = true

    serialize(obj: ArrayOrObject): string {
        try {
            // @ts-ignore
            return encode(obj)
        }
        catch(e) {
            console.error('Cbor encoding error', e)
            throw e
        }
    }

    unserialize(payload: string): ArrayOrObject {
        try {
            return decode(Buffer.from(payload))
        }
        catch(e) {
            console.error('Cbor decoding error', e)
            throw e
        }
    }
}

export default new CborSerializer()
