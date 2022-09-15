import { encode, decode } from 'cbor-x';
import Serializer, { BinarySerializer, SerializerType } from '../serializer';

export class CborSerializer extends BinarySerializer implements Serializer {
    constructor() {
        super();
        this.encode = encode;
        this.decode = decode;
    }
    get type(): SerializerType {
        return SerializerType.Cbor;
    }
    override unserialize(data: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            try {
                if (data instanceof ArrayBuffer) {
                    resolve(this.decode(new Uint8Array(data)));
                } else {
                    resolve(this.decode(data));
                }
            } catch (e) {
                reject(e);
            }
        });
    }
}

export default new CborSerializer();
