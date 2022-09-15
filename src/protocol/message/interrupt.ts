import Message, { MessageType } from '../message';
import type { KwArgs } from '../../types';

export default class InterruptMessage extends Message {
    constructor(requestId: number, options: KwArgs) {
        super(MessageType.INTERRUPT, requestId, options);
    }

    public get request_id(): number {
        return this._args[0];
    }

    public get options(): KwArgs {
        return this._args[1];
    }
}
