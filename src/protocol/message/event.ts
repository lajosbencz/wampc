import Message, { MessageType } from '../message'
import { MessageAppendArgsKwArgs } from '../message'
import { KwArgs } from '../../types'

export default class EventMessage extends Message {
    constructor(
        subscriptionId: number,
        publicationId: number,
        details: KwArgs,
        args?: any[],
        kwArgs?: KwArgs
    ) {
        super(
            MessageType.EVENT,
            subscriptionId,
            publicationId,
            details,
            args,
            kwArgs
        )
    }

    public get subscription_id(): number {
        return this._args[0]
    }

    public get publication_id(): number {
        return this._args[1]
    }

    public get details(): KwArgs {
        return this._args[2]
    }

    public get args(): any[] {
        return this._args[3]
    }

    public get kwArgs(): KwArgs {
        return this._args[4]
    }

    public asArray(): any[] {
        const a: any[] = [
            this._type,
            this.subscription_id,
            this.publication_id,
            this.details,
        ]
        MessageAppendArgsKwArgs(this, a)
        return a
    }
}
