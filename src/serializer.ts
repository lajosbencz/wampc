import { ProtocolType } from './protocol';
import { decode } from '@msgpack/msgpack';

export enum SerializerType {
    Json = 'json',
    MsgPack = 'msgpack',
    Cbor = 'cbor',
}

export default interface Serializer {
    type: SerializerType;
    isBinary: boolean;
    serialize: (obj: any) => Promise<any>;
    unserialize: (payload: any) => Promise<any>;
}

export class BinarySerializer {
    encode: (d: any) => any = () => {};
    decode: (d: any) => any = () => {};
    get isBinary(): boolean {
        return true;
    }
    serialize(d: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            try {
                resolve(this.encode(d));
            } catch (e) {
                reject(e);
            }
        });
    }
    unserialize(data: any): Promise<any> {
        return new Promise<any>(resolve => {
            if (data instanceof ArrayBuffer || data instanceof Buffer) {
                resolve(decode(new Uint8Array(data)));
            } else {
                const reader = new FileReader();
                reader.onload = function () {
                    resolve(decode(new Uint8Array(this.result as ArrayBuffer)));
                };
                reader.readAsArrayBuffer(data);
            }
        });
    }
}

export async function serializerFromProtocol(p: ProtocolType): Promise<Serializer> {
    switch (p) {
        case ProtocolType.Wamp2Json:
            return (await import('./serializer/json')).default as unknown as Serializer;
        case ProtocolType.Wamp2Msgpack:
            return (await import('./serializer/msgpack')).default as unknown as Serializer;
        case ProtocolType.Wamp2Cbor:
            return (await import('./serializer/cbor')).default as unknown as Serializer;
        default:
            throw new Error(`unknown protocol: ${p}`);
    }
}
