import { encode, decode } from 'cborg';
import Serializer, { SerializerType } from '../serializer';

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
                // @ts-ignore
                resolve(encode(obj));
            } catch (e) {
                console.error('Cbor encoding error: ', e);
                reject(e);
            }
        });
    }

    async unserialize(payload: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            try {
                // @ts-ignore
                resolve(decode(payload));
            } catch (e) {
                console.error('Cbor decoding error', e);
                reject(e);
            }
        });
    }
}

export default new CborSerializer();
