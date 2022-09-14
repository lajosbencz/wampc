import msgpack5 from 'msgpack5'
import Serializer, { SerializerType } from '../serializer'

//const msgpack = msgpack5({ forceFloat64: true })
const msgpack = msgpack5()

export class MsgpackSerializer implements Serializer {
    get type(): SerializerType {
        return SerializerType.MsgPack
    }
    get isBinary(): boolean {
        return true
    }

    async serialize(obj: any): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            try {
                // @ts-ignore
                resolve(msgpack.encode(obj))
            } catch (e) {
                reject(e)
            }
        })
    }

    async unserialize(payload: string): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                const type = payload.constructor.name
                if (type === 'ArrayBuffer' || type === 'Buffer') {
                    // @ts-ignore
                    resolve(msgpack.decode(new Uint8Array(payload)))
                } else {
                    const reader = new FileReader()
                    reader.onload = function () {
                        // @ts-ignore
                        resolve(msgpack.decode(new Uint8Array(this.result)))
                    }
                    // @ts-ignore
                    reader.readAsArrayBuffer(payload)
                }
            } catch (e) {
                reject(e)
            }
        })
    }
}

export default new MsgpackSerializer()
