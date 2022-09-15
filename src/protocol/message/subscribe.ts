import Message, { MessageType } from '../message';
import type { KwArgs } from '../../types';

export default class SubscribeMessage extends Message {
    constructor(requestId: number, options: KwArgs, topic: string) {
        super(MessageType.SUBSCRIBE, requestId, options, topic);
    }

    public get request_id(): number {
        return this._args[0];
    }

    public get options(): KwArgs {
        return this._args[1];
    }

    public get topic(): string {
        return this._args[2];
    }
}
