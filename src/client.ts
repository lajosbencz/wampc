import Connection, { ConnectionOptions, ConnectionOptionsDefaults } from './connection';
import type { ProtocolType } from './protocol';
import { SerializerType } from './serializer';
import type { Args, KwArgs, RegistrationCallback, SubscriptionHandler } from './types';
import Publication from './protocol/publication';
import Registration from './protocol/registration';
import Result from './protocol/result';
import Session from './protocol/session';
import Subscription from './protocol/subscription';

export interface Options {
    serializers?: SerializerType[];
    authid?: string;
    authmethods?: string[];
    onchallenge?: (...args: any) => any;
}

export const OptionsDefaults = {
    serializers: [SerializerType.Json],
    authid: 'anonymous',
    authmethods: ['anonymous'],
};

export default class Client {
    protected _connection: Connection;

    public onJoin: (details: KwArgs) => void = () => {};
    public onLeave: (reason: string, details: KwArgs) => void = () => {};

    constructor(url: string, realm: string, options?: Options) {
        options = Object.assign({}, OptionsDefaults, options ?? {});
        const connectionOptions: ConnectionOptions = Object.assign({}, ConnectionOptionsDefaults, {
            authid: options.authid,
            authmethods: options.authmethods,
            protocols: (options.serializers as SerializerType[]).map(s => ('wamp.2.' + s) as ProtocolType),
            onchallenge: options.onchallenge,
        });
        this._connection = new Connection(this, url, realm, connectionOptions);
    }

    public async close(): Promise<CloseEvent> {
        await this._connection.leave();
        return await this._connection.close();
    }

    public get connection(): Connection {
        return this._connection;
    }

    public async getSession(): Promise<Session> {
        await this._connection.tryOpen();
        return await this._connection.getSession();
    }

    public async call(rpc: string, args?: Args, kwArgs?: KwArgs, options?: KwArgs): Promise<Result> {
        return await this._connection.call(rpc, args, kwArgs, options);
    }

    public async subscribe(topic: string, handler: SubscriptionHandler, options?: KwArgs): Promise<Subscription> {
        return await this._connection.subscribe(topic, handler, options);
    }

    public async register(procedure: string, endpoint: RegistrationCallback, options?: KwArgs): Promise<Registration> {
        return await this._connection.register(procedure, endpoint, options);
    }

    public async publish(topic: string, args?: Args, kwArgs?: KwArgs, options?: KwArgs): Promise<Publication | void> {
        return await this._connection.publish(topic, args, kwArgs, options);
    }
}
