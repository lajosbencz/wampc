import Connection from '../connection';
import type { Args, KwArgs } from '../types';
import Deferred from '../deferred';

export default class Subscription {
    topic: any;
    handler: any;
    options: KwArgs;
    connection: Connection;
    id: number;
    active: boolean = true;

    protected _on_unsubscribe: Deferred<any> = new Deferred<any>();

    constructor(
        topic: string,
        handler: (args?: Args, kwArgs?: KwArgs) => void,
        options: KwArgs,
        connection: Connection,
        id: number,
    ) {
        this.topic = topic;
        this.handler = handler;
        this.options = options;
        this.connection = connection;
        this.id = id;
        this.active = true;
    }

    public get on_unsubscribe(): Promise<any> {
        return this._on_unsubscribe.promise;
    }

    public resolve(reason?: any) {
        this._on_unsubscribe.resolve(reason);
    }

    async unsubscribe(): Promise<boolean> {
        return await this.connection.unsubscribe(this);
    }
}
