import { Deferred } from 'es6-deferred-promise'
import 'websocket-polyfill'
import { Message } from '../message'
import { ProtocolType } from '../protocol'
import { serializerFromProtocol } from '../serializer'
import { Transport, Transporter } from '../transport'
import { ArrayOrObject } from '../types'

export default class WebSocketTransport extends Transport implements Transporter {
    protected _ws?: WebSocket
    onMessage: (msg: Message) => Promise<void> = async () => { }

    // constructor(options: TransportOptions) {
    //     super(options)
    // }

    async open(): Promise<Event> {
        const ws = new WebSocket(this._options.url, this._options.protocols)
        ws.onopen = async (evt: Event) => {
            this._serializer = await serializerFromProtocol(ws.protocol as ProtocolType)
            this._deferred_open?.resolve(evt)
        }
        ws.onmessage = (evt: MessageEvent) => {
            const data = this._serializer.unserialize(evt.data)
            console.log('<', data)
            const msg = Message.fromArray(data as any[])
            this.onMessage(msg).catch(console.error)
        }
        ws.onerror = (evt: any) => {
            this._deferred_open?.reject(evt.error)
            this._deferred_close?.reject(evt.error)
        }
        ws.onclose = (evt: CloseEvent) => {
            this._deferred_close?.resolve(evt)
        }
        this._ws = ws
        return await this._deferred_open.promise
    }

    async close(code?: number, reason?: string): Promise<CloseEvent> {
        this._deferred_close = new Deferred<CloseEvent>()
        try {
            this._ws?.close(code, reason)
        }
        catch (e) {
            // console.error(e)
        }
        return await this._deferred_close.promise
    }

    send(data: ArrayOrObject): void {
        console.log('>', data)
        this._ws?.send(this._serializer.serialize(data))
    }
}
