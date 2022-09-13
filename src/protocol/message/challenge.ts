import Message, {MessageType} from "../message";
import {KwArgs, Nullable} from "../../types";

export default class ChallengeMessage extends Message {
    constructor(authmethod: string, extra?: KwArgs) {
        super(MessageType.CHALLENGE, authmethod, extra ?? {})
    }

    public get authmethod(): string {
        return this._args[0]
    }

    public get extra(): Nullable<KwArgs> {
        return this._args[1]
    }
}
