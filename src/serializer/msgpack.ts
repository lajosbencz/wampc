import { encode, decode } from '@msgpack/msgpack';
import Serializer, { SerializerType } from '../serializer';

export class MsgpackSerializer implements Serializer {
    get type(): SerializerType {
        return SerializerType.MsgPack;
    }
    get isBinary(): boolean {
        return true;
    }

    async serialize(obj: any): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            try {
                resolve(Buffer.from(encode(obj)).toString());
            } catch (e) {
                reject(e);
            }
        });
    }

    async unserialize(payload: string): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                resolve(decode(Buffer.from(payload)));
            } catch (e) {
                reject(e);
            }
        });
    }
}

export default new MsgpackSerializer();
