import Message, {MessageType} from "../message";
import {MessageAppendArgsKwArgs} from "../message";
import {Args, KwArgs, Nullable} from "../../types";

export default class PublishMessage extends Message {
    constructor(
        requestId: number,
        options: KwArgs,
        topic: string,
        args?: any[],
        kwArgs?: KwArgs
    ) {
        super(MessageType.PUBLISH, requestId, options, topic, args, kwArgs)
    }

    public get request_id(): number {
        return this._args[0]
    }

    public get options(): KwArgs {
        return this._args[1]
    }

    public get topic(): string {
        return this._args[2]
    }

    public get args(): Nullable<Args> {
        return this._args[3]
    }

    public get kwArgs(): Nullable<KwArgs> {
        return this._args[4]
    }

    public asArray(): any[] {
        const a: any[] = [this._type, this.request_id, this.options, this.topic]
        MessageAppendArgsKwArgs(this, a)
        return a
    }
}
