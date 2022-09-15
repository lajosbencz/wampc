import Deferred from '../deferred';
import Message from '../protocol/message';
import { MessageFromArray } from '../protocol/message_util';
import type { ProtocolType } from '../protocol';
import { serializerFromProtocol } from '../serializer';
import { Transport, Transporter } from '../transport';
import type { ArrayOrObject } from '../types';

// https://github.com/samchon/tstl/blob/f1d7ae8d17413f07813cf36eef5b378b4f2200a8/src/utility/node.ts
if (
    typeof global === 'object' &&
    typeof global.process === 'object' &&
    typeof global.process.versions === 'object' &&
    typeof global.process.versions.node !== 'undefined'
) {
    require('websocket-polyfill');
}

export default class WebSocketTransport extends Transport implements Transporter {
    protected _ws?: WebSocket;
    onMessage: (msg: Message) => Promise<void> = async () => {};

    // constructor(options: TransportOptions) {
    //     super(options)
    // }

    async open(): Promise<Event> {
        const ws = new WebSocket(this._options.url, this._options.protocols);
        ws.onopen = async (evt: Event) => {
            this._serializer = await serializerFromProtocol(ws.protocol as ProtocolType);
            if (this._serializer.isBinary) {
                ws.binaryType = 'arraybuffer';
            }
            this._deferred_open?.resolve(evt);
        };
        ws.onmessage = async (evt: MessageEvent) => {
            const data = await this._serializer.unserialize(evt.data);
            // console.log('<', data);
            const msg = MessageFromArray(data as any[]);
            await this.onMessage(msg);
        };
        ws.onerror = (evt: any) => {
            this._deferred_open?.reject(evt.error);
            this._deferred_close?.reject(evt.error);
        };
        ws.onclose = (evt: CloseEvent) => {
            this._deferred_close?.resolve(evt);
        };
        this._ws = ws;
        return await this._deferred_open.promise;
    }

    async close(code?: number, reason?: string): Promise<CloseEvent> {
        this._deferred_close = new Deferred<CloseEvent>();
        try {
            this._ws?.close(code, reason);
        } catch (e) {
            // console.error(e)
        }
        return await this._deferred_close.promise;
    }

    async send(data: ArrayOrObject): Promise<void> {
        // console.log('>', data);
        this._ws?.send(await this._serializer.serialize(data));
    }
}
