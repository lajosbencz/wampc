import Message, { MessageType } from '../message';
import type { Args, KwArgs, Optional } from '../../types';

export default class ResultMessage extends Message {
    constructor(requestId: number, details: KwArgs, args?: Args, kwArgs?: KwArgs) {
        super(MessageType.RESULT, requestId, details, args, kwArgs);
    }

    public get request_id(): number {
        return this._args[0];
    }

    public get details(): KwArgs {
        return this._args[1];
    }

    public get args(): Optional<Args> {
        return this._args[2];
    }

    public get kwArgs(): Optional<KwArgs> {
        return this._args[3];
    }
}
