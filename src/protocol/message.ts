import { TodoType } from '../types'

export enum MessageType {
    HELLO = 1,
    WELCOME = 2,
    ABORT = 3,
    CHALLENGE = 4,
    AUTHENTICATE = 5,
    GOODBYE = 6,
    ERROR = 8,
    PUBLISH = 16,
    PUBLISHED = 17,
    SUBSCRIBE = 32,
    SUBSCRIBED = 33,
    UNSUBSCRIBE = 34,
    UNSUBSCRIBED = 35,
    EVENT = 36,
    CALL = 48,
    CANCEL = 49,
    RESULT = 50,
    REGISTER = 64,
    REGISTERED = 65,
    UNREGISTER = 66,
    UNREGISTERED = 67,
    INVOCATION = 68,
    INTERRUPT = 69,
    YIELD = 70,
}

export function MessageAppendArgsKwArgs(m: TodoType, a: any[]): void {
    if (m.args !== undefined) {
        a.push(m.args)
        if (m.kwArgs !== undefined) {
            a.push(m.kwArgs)
        }
    } else if (m.kwArgs !== undefined) {
        a.push([])
        a.push(m.kwArgs)
    }
}

export default class Message {
    protected _type: MessageType
    protected _args: any[]
    public constructor(type: MessageType, ...args: any) {
        this._type = type
        this._args = args
    }

    public getType(): MessageType {
        return this._type
    }

    public asArray(): any[] {
        return [this._type, ...this._args]
    }
}
