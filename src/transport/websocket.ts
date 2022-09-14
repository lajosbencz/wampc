import { Deferred } from 'es6-deferred-promise'
import 'websocket-polyfill'
import Message from '../protocol/message'
import { MessageFromArray } from '../protocol/message_util'
import { ProtocolType } from '../protocol'
import { serializerFromProtocol } from '../serializer'
import { Transport, Transporter } from '../transport'
import { ArrayOrObject } from '../types'

export default class WebSocketTransport
    extends Transport
    implements Transporter
{
    protected _ws?: WebSocket
    onMessage: (msg: Message) => Promise<void> = async () => {}

    // constructor(options: TransportOptions) {
    //     super(options)
    // }

    async open(): Promise<Event> {
        const ws = new WebSocket(this._options.url, this._options.protocols)
        ws.onopen = async (evt: Event) => {
            this._serializer = await serializerFromProtocol(
                ws.protocol as ProtocolType
            )
            this._deferred_open?.resolve(evt)
        }
        ws.onmessage = async (evt: MessageEvent) => {
            const data = await this._serializer.unserialize(evt.data)
            console.log('<', data)
            const msg = MessageFromArray(data as any[])
            await this.onMessage(msg)
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
        } catch (e) {
            // console.error(e)
        }
        return await this._deferred_close.promise
    }

    async send(data: ArrayOrObject): Promise<void> {
        console.log('>', data)
        this._ws?.send(await this._serializer.serialize(data))
    }
}
