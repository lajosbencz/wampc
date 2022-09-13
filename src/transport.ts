import { Deferred } from 'es6-deferred-promise'
import { Message } from './message'
import { ProtocolType } from './protocol'
import Serializer from './serializer'
import JsonSerializer from './serializer/json'
import { ArrayOrObject } from './types'

export enum TransportType {
    WebSocket = 'websocket',
    RawSocket = 'rawsocket',
    LongPoll = 'longpoll',
}

export interface Transporter {
    onMessage: (msg: Message) => Promise<void>
    open: () => Promise<Event>
    close: (code?: number, reason?: string) => Promise<CloseEvent>
    send: (data: ArrayOrObject) => void
}

export interface TransportOptions {
    url: string
    protocols?: ProtocolType[]
}

export const TransportOptionsDefaults = {
    url: '',
    protocols: [ProtocolType.Wamp2Json],
}

export abstract class Transport {
    protected _options: TransportOptions
    protected _serializer: Serializer
    protected _deferred_open: Deferred<any>
    protected _deferred_close?: Deferred<any>

    constructor(options: TransportOptions) {
        this._options = options
        this._serializer = JsonSerializer
        this._deferred_open = new Deferred<Event>()
    }
}
