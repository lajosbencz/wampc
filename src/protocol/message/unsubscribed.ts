import Message, { MessageType } from '../message'
import { KwArgs, Nullable } from '../../types'

export default class UnsubscribedMessage extends Message {
    constructor(requestId: number, details?: KwArgs) {
        super(MessageType.UNSUBSCRIBED, requestId, details)
    }

    public get request_id(): number {
        return this._args[0]
    }

    public get details(): Nullable<KwArgs> {
        if (this._args.length > 1) {
            return this._args[1]
        }
        return null
    }
}
