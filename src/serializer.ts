import { ProtocolType } from './protocol'
import { ArrayOrObject } from './types'

export enum SerializerType {
    Json = 'json',
    MsgPack = 'msgpack',
    Cbor = 'cbor',
}

export default interface Serializer {
    type: SerializerType
    isBinary: boolean
    serialize: (obj: ArrayOrObject) => string
    unserialize: (payload: string) => ArrayOrObject
}

export async function serializerFromProtocol(p: ProtocolType): Promise<Serializer> {
    switch (p) {
        case ProtocolType.Wamp2Json:
            return (await import('./serializer/json')).default as unknown as Serializer
        case ProtocolType.Wamp2Msgpack:
            return (await import('./serializer/msgpack')).default as unknown as Serializer
        case ProtocolType.Wamp2Cbor:
            return (await import('./serializer/cbor')).default as unknown as Serializer
        default:
            throw new Error(`unknown protocol: ${p}`)
    }
}
