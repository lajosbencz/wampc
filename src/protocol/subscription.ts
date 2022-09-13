import Connection from '../connection'
import { Args, KwArgs } from '../types'

export default class Subscription {
    topic: any
    handler: any
    options: {}
    connection: Connection
    id: number
    active: boolean = true

    constructor(
        topic: string,
        handler: (args?: Args, kwArgs?: KwArgs) => void,
        options: {},
        connection: Connection,
        id: number
    ) {
        this.topic = topic
        this.handler = handler
        this.options = options
        this.connection = connection
        this.id = id
        this.active = true
    }

    async unsubscribe(): Promise<boolean> {
        return await this.connection.unsubscribe(this)
    }
}
