import Message, {MessageType} from "../message";
import {KwArgs, Nullable} from "../../types";

export default class AuthenticateMessage extends Message {
    constructor(signature: string, extra?: KwArgs) {
        super(MessageType.AUTHENTICATE, signature, extra)
    }

    public get signature(): string {
        return this._args[0]
    }

    public get extra(): Nullable<KwArgs> {
        return this._args[1]
    }
}
