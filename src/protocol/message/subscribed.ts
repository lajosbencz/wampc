import Message, { MessageType } from '../message'

export default class SubscribedMessage extends Message {
    constructor(requestId: number, id: number) {
        super(MessageType.SUBSCRIBED, requestId, id)
    }

    public get request_id(): number {
        return this._args[0]
    }

    public get subscription_id(): number {
        return this._args[1]
    }
}
