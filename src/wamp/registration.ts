import Connection from '../connection'
import { Args, KwArgs } from '../types'
import Result from './result'

export default class Registration {
    procedure: string = ''
    endpoint: (args: [], kwArgs: {}) => Result
    options: {} = {}
    connection: Connection
    id: number = 0
    active: boolean = true

    constructor(
        procedure: string,
        endpoint: (args: Args, kwArgs: KwArgs) => Result,
        options: {},
        connection: Connection,
        id: number
    ) {
        this.procedure = procedure
        this.endpoint = endpoint
        this.options = options
        this.connection = connection
        this.id = id
        this.active = true
    }

    async unregister(): Promise<void> {
        return await this.connection.unregister(this)
    }
}
