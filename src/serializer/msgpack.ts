import { encode, decode } from '@msgpack/msgpack';
import Serializer, { BinarySerializer, SerializerType } from '../serializer';

export class MsgpackSerializer extends BinarySerializer implements Serializer {
    get type(): SerializerType {
        return SerializerType.MsgPack;
    }
    constructor() {
        super();
        this.encode = encode;
        this.decode = decode;
    }
    public override unserialize(data: any): Promise<any> {
        return new Promise<any>(resolve => {
            if(data instanceof ArrayBuffer || data instanceof Buffer) {
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

export default new MsgpackSerializer();
