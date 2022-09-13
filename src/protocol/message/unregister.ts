import Message, {MessageType} from "../message";

export default class UnregisterMessage extends Message {
    constructor(requestId: number, registrationId: number) {
        super(MessageType.UNREGISTER, requestId, registrationId)
    }

    public get request_id(): number {
        return this._args[0]
    }

    public get registration_id(): number {
        return this._args[1]
    }
}
