import { encode, decode } from 'cborg';
import Serializer, { SerializerType } from '../serializer';
import Buffer from '../buffer';

export class CborSerializer implements Serializer {
    get type(): SerializerType {
        return SerializerType.Cbor;
    }
    get isBinary(): boolean {
        return true;
    }

    async serialize(obj: any): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                const e = encode(obj);
                console.log('>encoded', e)
                const b = Buffer.alloc(e.length)
                b.set(e)
                console.log('>buffer', b)
                resolve(b.toString())
            } catch (e) {
                reject(e)
            }
        });
    }

    async unserialize(payload: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            try {
                const b = Buffer.from(payload)
                console.log('<buffer', b)
                const d = decode(b)
                console.log('<decode', d)
                resolve(d)
            } catch (e) {
                reject(e)
            }
        });
    }
}

export default new CborSerializer();
