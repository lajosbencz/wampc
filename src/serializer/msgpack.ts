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
}

export default new MsgpackSerializer();
