import { MessageType } from '../message';
import SubscribedMessage from './subscribed';

export default class UnsubscribeMessage extends SubscribedMessage {
    constructor(requestId: number, id: number) {
        super(requestId, id);
        this._type = MessageType.UNSUBSCRIBE;
    }
}
