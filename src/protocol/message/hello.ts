import Message, { MessageType } from '../message';
import type { KwArgs, Nullable } from '../../types';

export default class HelloMessage extends Message {
    constructor(realm: string, details?: KwArgs) {
        super(MessageType.HELLO, realm, details);
    }

    public get realm(): string {
        return this._args[0];
    }

    public get details(): Nullable<KwArgs> {
        return this._args[1];
    }
}
