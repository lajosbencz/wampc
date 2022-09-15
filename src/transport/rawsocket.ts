import type { ArrayOrObject, TodoType } from '../types';
import { Transport, Transporter } from '../transport';
import Message from '../protocol/message';
import { MessageFromArray } from '../protocol/message_util';
import { Protocol, ProtocolOptions } from './rawsocket/protocol';
import { Deferred } from 'es6-deferred-promise';

export default class RawSocketTransport extends Transport implements Transporter {
    protected _protocol?: Protocol;
    onMessage: (msg: Message) => Promise<void> = async () => {};

    // constructor(options: TransportOptions) {
    //     super(options)
    // }

    async open(): Promise<Event> {
        let connectionOptions;
        const url = new URL(this._options.url);
        if (url.protocol === 'unix' || url.protocol === 'sock') {
            connectionOptions = {
                path: this._options.url,
                allowHalfOpen: true,
            };
        } else {
            connectionOptions = {
                port: url.port ?? 8000,
                host: url.hostname ?? 'localhost',
                allowHalfOpen: true,
            };
        }
        const Socket = (await import('net')).Socket;
        const socket = new Socket();
        const protocol = new Protocol(socket, {
            serializer: (this._options.protocols as string[]).map(p => p.split('.')[2])[0],
        } as ProtocolOptions);

        protocol.on('connect', evt => {
            console.log('RawSocket transport negotiated');
            this._deferred_open.resolve(evt);
        });

        protocol.on('data', async raw => {
            const data = await this._serializer.unserialize(raw);
            console.log('<', data);
            const msg = MessageFromArray(data as any[]);
            await this.onMessage(msg);
        });

        protocol.on('close', hadError => {
            console.log('RawSocket transport closed');
            this._deferred_close?.resolve({
                code: 999,
                reason: '',
                wasClean: !hadError,
            });
        });

        protocol.on('error', error => {
            console.error('RawSocket transport error', error);
            this._deferred_open.reject(error);
            this._deferred_close?.reject(error);
        });

        this._protocol = protocol;

        // @ts-expect-error: No overload matches this call.
        socket.connect(connectionOptions, null);

        return await this._deferred_open.promise;
    }

    async close(code?: number, reason?: string): Promise<TodoType> {
        this._deferred_close = new Deferred<any>();
        await this._protocol?.close();
        return await this._deferred_close.promise;
    }

    async send(data: ArrayOrObject): Promise<void> {
        console.log('>', data);
        this._protocol?.write(await this._serializer.serialize(data));
    }
}
