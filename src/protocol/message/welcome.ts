import Message, {MessageType} from "../message";
import {KwArgs} from "../../types";

export default class WelcomeMessage extends Message {
    constructor(sessionId: number, details: KwArgs) {
        super(MessageType.WELCOME, sessionId, details)
    }

    public get session_id(): number {
        return this._args[0]
    }

    public get details(): KwArgs {
        return this._args[1]
    }
}
