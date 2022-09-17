import Message, { MessageType } from '../message';
import type { KwArgs, Optional } from '../../types';

export default class ChallengeMessage extends Message {
    constructor(authmethod: string, extra?: KwArgs) {
        super(MessageType.CHALLENGE, authmethod, extra ?? {});
    }

    public get authmethod(): string {
        return this._args[0];
    }

    public get extra(): Optional<KwArgs> {
        return this._args[1];
    }
}
