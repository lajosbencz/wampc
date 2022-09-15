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
                resolve(Buffer.from(encode(obj)).toString());
            } catch (e) {
                reject(e);
            }
        });
    }

    async unserialize(payload: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            try {
                resolve(decode(Buffer.from(payload)));
            } catch (e) {
                reject(e);
            }
        });
    }
}

export default new CborSerializer();
