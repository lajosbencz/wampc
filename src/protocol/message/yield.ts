import Message, { MessageType } from '../message';
import { MessageAppendArgsKwArgs } from '../message';
import type { Args, KwArgs, Nullable } from '../../types';

export default class YieldMessage extends Message {
    constructor(requestId: number, options: KwArgs, args?: Args, kwArgs?: KwArgs) {
        super(MessageType.YIELD, requestId, options, args, kwArgs);
    }

    public get request_id(): number {
        return this._args[0];
    }

    public get options(): KwArgs {
        return this._args[1];
    }

    public get args(): Nullable<Args> {
        return this._args[2];
    }

    public get kwArgs(): Nullable<KwArgs> {
        return this._args[3];
    }

    public asArray(): any[] {
        const a: any[] = [this._type, this.request_id, this.options];
        MessageAppendArgsKwArgs(this, a);
        return a;
    }
}
