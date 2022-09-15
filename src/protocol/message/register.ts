import Message, { MessageType } from '../message';
import type { KwArgs } from '../../types';

export default class RegisterMessage extends Message {
    constructor(requestId: number, options: KwArgs, procedure: string) {
        super(MessageType.REGISTER, requestId, options, procedure);
    }

    public get request_id(): number {
        return this._args[0];
    }

    public get options(): KwArgs {
        return this._args[1];
    }

    public get procedure(): string {
        return this._args[2];
    }
}
