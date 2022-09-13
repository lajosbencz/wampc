import Message, {MessageType} from "../message";
import {Args, KwArgs, Nullable} from "../../types";
import {MessageAppendArgsKwArgs} from "../message";

export default class ErrorMessage extends Message {
    constructor(
        errorType: MessageType,
        requestId: number,
        details: KwArgs,
        error: string,
        args?: Args,
        kwArgs?: KwArgs
    ) {
        super(
            MessageType.ERROR,
            errorType,
            requestId,
            details,
            error,
            args,
            kwArgs
        )
    }

    public get error_type(): MessageType {
        return this._args[0]
    }

    public get request_id(): number {
        return this._args[1]
    }

    public get details(): KwArgs {
        return this._args[2]
    }

    public get error(): string {
        return this._args[3]
    }

    public get args(): Nullable<Args> {
        return this._args[3]
    }

    public get kwArgs(): Nullable<KwArgs> {
        return this._args[4]
    }

    public asArray(): any[] {
        const a: any[] = [
            this._type,
            this.error_type,
            this.request_id,
            this.details,
            this.error,
        ]
        MessageAppendArgsKwArgs(this, a)
        return a
    }
}
