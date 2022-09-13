import EventEmitter from "events"
import {SerializerType} from "../../serializer"
import {Nullable} from "../../types"
import {Socket} from 'net'

export enum ProtocolStatus {
    CLOSED = -1,
    UNINITIATED = 0,
    NEGOTIATING = 1,
    NEGOTIATED = 2,
    RXHEAD = 3,
    RXDATA = 4,
    RXPING = 5,
    RXPONG = 6,
}

export const ProtocolSerializer: { [key: string]: number } = {
    json: 1,
    // msgpack: 2,
}

export const ProtocolMagicByte = 0x7f

export const ProtocolErrors: { [key: number]: string } = {
    0: 'illegal (must not be used)',
    1: 'serializer unsupported',
    2: 'maximum message length unacceptable',
    3: 'use of reserved bits (unsupported feature)',
    4: 'maximum connection count reached',
}

export enum ProtocolMessageTypes {
    WAMP = 0x0,
    PING = 0x1,
    PONG = 0x2,
}

export interface ProtocolOptions {
    fail_on_ping_timeout?: boolean
    strict_pong?: boolean
    ping_timeout?: number
    autoping?: number
    max_len_exp?: number
    serializer?: SerializerType
    packet_timeout?: number
}

export const ProtocolOptionsDefaults = {
    fail_on_ping_timeout: true,
    strict_pong: true,
    ping_timeout: 2000,
    autoping: 0,
    max_len_exp: 24,
    serializer: SerializerType.Json,
    packet_timeout: 2000,
}

export class ProtocolError extends Error {
}

export class Protocol {
    protected _options: ProtocolOptions
    protected _ping_timeout?: ReturnType<typeof setTimeout>
    protected _ping_payload: any
    protected _ping_interval?: ReturnType<typeof setInterval>
    protected _autoping_interval?: number
    protected _status = ProtocolStatus.UNINITIATED
    protected _stream: Socket
    protected _emitter: EventEmitter
    protected _buffer: Buffer
    protected _bufferLen: number
    protected _msgLen: number
    protected _peer_serializer: number = -1
    protected _peer_max_len_exp: number = 0

    constructor(stream: Socket, options?: ProtocolOptions) {
        this._options = Object.assign({}, ProtocolOptionsDefaults, options ?? {})
        this._stream = stream
        this._emitter = new EventEmitter()
        this._buffer = Buffer.alloc(4)
        this._bufferLen = 0
        this._msgLen = 0

        this._stream.on('data', (data: any) => {
            this.read(data)
        })

        this._stream.on('connect', () => {
            this.handshake()
        })

        const proxyEvents = ['close', 'drain', 'end', 'error', 'timeout']
        proxyEvents.forEach((evt) => {
            this._stream.on(evt, (data: any) => {
                this._emitter.emit(evt, data)
            })
        })


        const serializerType = this._options.serializer as SerializerType
        const protocolSerializer = ProtocolSerializer[serializerType]
        if (protocolSerializer === undefined) throw new Error('invalid serializer for rawsocket: ' + serializerType)
    }

    close(): ProtocolStatus {
        this._status = ProtocolStatus.CLOSED
        this._stream.end()
        return this._status
    }

    write(msg: any, type?: number, callback?: (...args: any) => void): void {
        type = type === undefined ? 0 : type;
        // if (type === ProtocolMessageTypes.WAMP) {
        //     msg = JSON.stringify(msg)
        // }
        const msgLen = Buffer.byteLength(msg, 'utf8')
        if (msgLen > Math.pow(2, this._peer_max_len_exp)) {
            this._emitter.emit('error', new ProtocolError('Frame too big'))
            return
        }
        const frame = Buffer.alloc(msgLen + 4)
        frame.writeUint8(type, 0)
        frame.writeUintBE(msgLen, 1, 3)
        frame.write(msg, 4)
        this._stream.write(frame, callback)
    }

    ping(payload: string | number): void {
        payload = payload ?? 255
        if (Number.isInteger(payload)) {
            const base =
                'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ' +
                '0123456789&~"#\'{([-|`_\\^@)]=},?;.:/!*$<>'
            const len = Math.max(1, payload as number)
            payload = ''
            for (let i = 0; i < len; i++) {
                payload += base.charAt((Math.random() * base.length) | 0)
            }
        }
        this._ping_payload = payload
        return this.write(
            payload,
            ProtocolMessageTypes.PING,
            this.setupPingTimeout.bind(this)
        )
    }

    protected setupPingTimeout(): void {
        if (this._options.ping_timeout !== undefined && this._options.ping_timeout > 0) {
            this._ping_timeout = setTimeout(
                this.onPingTimeout.bind(this),
                this._options.ping_timeout
            )
        }
    }

    protected clearPingTimeout(): void {
        if (this._ping_timeout != null) {
            clearTimeout(this._ping_timeout)
            this._ping_timeout = undefined
        }
    }

    protected setupAutoPing(): void {
        this.clearAutoPing()
        if (this._options.autoping !== undefined && this._options.autoping > 0) {
            this._autoping_interval = setInterval(
                this.ping.bind(this),
                this._options.autoping
            )
        }
    }

    protected clearAutoPing(): void {
        if (this._autoping_interval !== undefined) {
            clearInterval(this._autoping_interval)
            this._autoping_interval = undefined
        }
    }

    protected onPingTimeout(): void {
        this._emitter.emit('error', new ProtocolError('PING timeout'))
        if (this._options.fail_on_ping_timeout) {
            this.close()
        }
    }

    protected read(data: any): void {
        let handler: any = null;
        let frame: number = -1
        switch (this._status) {
            case ProtocolStatus.CLOSED:
            case ProtocolStatus.UNINITIATED:
                this._emitter.emit(
                    'error',
                    new ProtocolError('Unexpected packet')
                )
                break
            case ProtocolStatus.NEGOTIATING:
                handler = this.handleHandshake
                frame = 4
                break
            case ProtocolStatus.NEGOTIATED:
            case ProtocolStatus.RXHEAD:
                this._status = ProtocolStatus.RXHEAD
                handler = this.handleHeaderPacket
                frame = 4
                break
            case ProtocolStatus.RXDATA:
                handler = this.handleDataPacket
                frame = this._msgLen
                break
            case ProtocolStatus.RXPING:
                handler = this.handlePingPacket
                frame = this._msgLen
                break
            case ProtocolStatus.RXPONG:
                handler = this.handlePongPacket
                frame = this._msgLen
                break
        }

        if (handler === null) {
            throw new ProtocolError('invalid handler')
        }
        if (frame === -1) {
            throw new ProtocolError('invalid frame')
        }

        // Get a frame of the expected size
        const chunks = this.splitBytes(data, frame)

        // Protocol#_splitBytes returns null if there isn't enough data to fill the
        // requested frame yet. Wait for more
        if (chunks == null) return

        // Call the packet handler with the frame
        this._status = handler.call(this, chunks[0])

        // If there is more data, handle it
        if (chunks[1].length > 0) {
            this.read(chunks[1])
        }
    }

    protected handshake(): void {
        if (this._status !== ProtocolStatus.UNINITIATED) {
            throw new ProtocolError('Handshake packet already sent')
        }

        // Compose handshake message
        const gday = Buffer.alloc(4)

        // Protocol magic byte
        gday.writeUInt8(ProtocolMagicByte, 0)
        // Announce message max length and serializer
        gday.writeUInt8((((this._options.max_len_exp as number) - 9) << 4) | ProtocolSerializer[this._options.serializer as SerializerType], 1)
        // Reserved bytes
        gday.writeUInt8(0x00, 2)
        gday.writeUInt8(0x00, 3)

        this._stream.write(gday)

        this._status = ProtocolStatus.NEGOTIATING
    }

    protected splitBytes(data: any, len: number): Nullable<any[]> {
        // If the buffer we have already isn't the right size, throw the data away
        // and make a new one
        if (len !== this._buffer.length) {
            this._buffer = Buffer.alloc(len)
            this._bufferLen = 0
        }
        // Push the data to the buffer
        data.copy(this._buffer, this._bufferLen)
        // If there still isn't enough data, increment the counter and return null
        const dataLen: number = data.length
        if ((this._bufferLen + dataLen) < len) {
            this._bufferLen += dataLen
            return null
            // Otherwise, return the requested frame and the leftover data
        } else {
            const bytes = this._buffer.subarray()
            const extra = data.slice(len - this._bufferLen)
            this._bufferLen = 0
            return [bytes, extra]
        }
    }

    protected handleHandshake(int32: Buffer): ProtocolStatus {
        // Check magic byte
        if (int32[0] !== ProtocolMagicByte) {
            const err = new ProtocolError('Invalid magic byte. Expected 0x' + ProtocolMagicByte.toString(16) + ', got 0x' + int32[0].toString(16))
            this._emitter.emit('error', err)
            return this.close()
        }

        // Check for error
        if ((int32[1] & 0x0f) === 0) {
            const errCode = int32[1] >> 4
            const err = new ProtocolError('Peer failed handshake: ' + (ProtocolErrors[errCode] ?? '0x' + errCode.toString(16)))
            this._emitter.emit('error', err)
            return this.close()
        }

        // Extract max message length and serializer
        this._peer_max_len_exp = (int32[1] >> 4) + 9
        this._peer_serializer = int32[1] & 0x0f

        // We only support JSON so far
        // TODO: Support more serializers
        if (!Object.values(ProtocolSerializer).includes(this._peer_serializer)) {
            const err = new ProtocolError('Unsupported serializer: 0x' + this._peer_serializer.toString(16))
            this._emitter.emit('error', err)
            return this.close()
        }

        // Protocol negotiation complete, we're connected to the peer and ready to
        // talk
        this._emitter.emit('connect')

        // Set up the auto ping
        this.setupAutoPing()

        return ProtocolStatus.NEGOTIATED
    }

    protected handleHeaderPacket(int32: Buffer): ProtocolStatus {
        const type = int32[0] & 0x0f

        // Decode integer and store it
        this._msgLen = int32.readUIntBE(1, 3)

        switch (type) {
            case ProtocolMessageTypes.WAMP: // WAMP frame
                return ProtocolStatus.RXDATA

            case ProtocolMessageTypes.PING: // PING frame
                return ProtocolStatus.RXPING

            case ProtocolMessageTypes.PONG: // PONG frame
                return ProtocolStatus.RXPONG

            default:
                this._emitter.emit(
                    'error',
                    new ProtocolError(
                        'Invalid frame type: 0x' + type.toString(16)
                    )
                )
                return this.close()
        }
    }

    protected handleDataPacket(buffer: Buffer): ProtocolStatus {
        const msg = buffer.toString('utf8')

        // Emit a data event for consumers
        this._emitter.emit('data', msg)

        return ProtocolStatus.RXHEAD
    }

    public handlePingPacket(buffer: Buffer): ProtocolStatus {
        this.write(buffer.toString('utf8'), ProtocolMessageTypes.PONG)
        return ProtocolStatus.RXHEAD
    }

    public handlePongPacket(buffer: Buffer): ProtocolStatus {
        // Clear the ping timeout (if any)
        this.clearPingTimeout()
        // If strict PONG checking is activated and the payloads don't match, throw
        // an error and close the connection
        if (
            this._options.strict_pong &&
            this._ping_payload !== buffer.toString('utf8')
        ) {
            this._emitter.emit(
                'error',
                new ProtocolError("PONG response payload doesn't match PING.")
            )

            return this.close()
        }
        return ProtocolStatus.RXHEAD
    }

    public on(evt: string | symbol, handler: (...args: any[]) => void): void {
        this._emitter.on(evt, handler)
    }

    public once(evt: string | symbol, handler: (...args: any[]) => void): void {
        this._emitter.once(evt, handler)
    }

    public removeListener(
        evt: string | symbol,
        handler: (...args: any[]) => void
    ): void {
        this._emitter.removeListener(evt, handler)
    }
}
