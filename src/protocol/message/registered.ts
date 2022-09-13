import Message, {MessageType} from "../message";

export default class RegisteredMessage extends Message {
    constructor(requestId: number, id: number) {
        super(MessageType.REGISTERED, requestId, id)
    }

    public get request_id(): number {
        return this._args[0]
    }

    public get registration_id(): number {
        return this._args[1]
    }
}
