import { encode, decode } from 'cbor';
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
}

export default new CborSerializer();
