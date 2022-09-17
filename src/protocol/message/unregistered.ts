import Message, { MessageType } from '../message';
import type { KwArgs, Optional } from '../../types';

export default class UnregisteredMessage extends Message {
    constructor(requestId: number, details?: KwArgs) {
        super(MessageType.UNREGISTERED, requestId, details);
    }

    public get request_id(): number {
        return this._args[0];
    }

    public get details(): Optional<KwArgs> {
        if (this._args.length > 1) {
            return this._args[1];
        }
        return undefined;
    }
}
