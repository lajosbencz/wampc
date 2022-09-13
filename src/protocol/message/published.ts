import Message, { MessageType } from '../message'

export default class PublishedMessage extends Message {
    constructor(requestId: number, id: number) {
        super(MessageType.PUBLISHED, requestId, id)
    }

    public get request_id(): number {
        return this._args[0]
    }

    public get publication_id(): number {
        return this._args[1]
    }
}
