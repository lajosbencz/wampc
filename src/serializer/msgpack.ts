import { encode, decode } from '@msgpack/msgpack';
import Serializer, { SerializerType } from '../serializer';
import Buffer from '../buffer';

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
                // @ts-ignore
                resolve(encode(obj));
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
