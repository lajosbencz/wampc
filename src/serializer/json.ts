import { ArrayOrObject } from '../types'
import Serializer, { SerializerType } from '../serializer'

export type JSONReviver = (key: string, value: any) => any
export type JSONReplacer = (key: string, value: any) => any

export class JsonSerializer implements Serializer {
    type: SerializerType = SerializerType.Json
    isBinary: boolean = false

    protected replacer?: JSONReplacer = undefined
    protected reviver?: JSONReviver = undefined

    constructor(replacer?: JSONReplacer, reviver?: JSONReviver) {
        this.replacer = replacer
        this.reviver = reviver
    }

    serialize(obj: ArrayOrObject): string {
        return JSON.stringify(obj, this.replacer)
    }

    unserialize(payload: string): ArrayOrObject {
        return JSON.parse(payload, this.reviver)
    }
}

export default new JsonSerializer()
