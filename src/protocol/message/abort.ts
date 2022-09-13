import Message, {MessageType} from "../message";
import {KwArgs} from "../../types";

export default class AbortMessage extends Message {
    constructor(details: KwArgs, reason: string) {
        super(MessageType.ABORT, details, reason)
    }

    public get details(): KwArgs {
        return this._args[0]
    }

    public get reason(): string {
        return this._args[1]
    }
}
