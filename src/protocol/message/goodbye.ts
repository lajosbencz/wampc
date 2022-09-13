import { MessageType } from '../message'
import AbortMessage from './abort'
import { KwArgs } from '../../types'

export default class GoodbyeMessage extends AbortMessage {
    constructor(details: KwArgs, reason: string) {
        super(details, reason)
        this._type = MessageType.GOODBYE
    }
}
