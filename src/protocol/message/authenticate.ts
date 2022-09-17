import Message, { MessageType } from '../message';
import type { KwArgs, Optional } from '../../types';

export default class AuthenticateMessage extends Message {
    constructor(signature: string, extra?: KwArgs) {
        super(MessageType.AUTHENTICATE, signature, extra);
    }

    public get signature(): string {
        return this._args[0];
    }

    public get extra(): Optional<KwArgs> {
        return this._args[1];
    }
}
