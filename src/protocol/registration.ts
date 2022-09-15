import Connection from '../connection';
import type { Args, KwArgs } from '../types';
import Result from './result';
import Deferred from '../deferred';

export default class Registration {
    procedure: string = '';
    endpoint: (args: Args, kwArgs: KwArgs) => Result;
    options: KwArgs = {};
    connection: Connection;
    id: number = 0;
    active: boolean = true;

    protected _on_unregister: Deferred<any> = new Deferred<any>();

    constructor(
        procedure: string,
        endpoint: (args: Args, kwArgs: KwArgs) => Result,
        options: KwArgs,
        connection: Connection,
        id: number,
    ) {
        this.procedure = procedure;
        this.endpoint = endpoint;
        this.options = options;
        this.connection = connection;
        this.id = id;
        this.active = true;
    }

    public get on_unregister(): Promise<any> {
        return this._on_unregister.promise;
    }

    public resolve(reason?: any) {
        this._on_unregister.resolve(reason);
    }

    async unregister(): Promise<void> {
        return await this.connection.unregister(this);
    }
}
