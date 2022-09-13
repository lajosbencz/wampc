import { Args, KwArgs, Nullable, TodoType } from './types'

export enum MessageType {
    HELLO = 1,
    WELCOME = 2,
    ABORT = 3,
    CHALLENGE = 4,
    AUTHENTICATE = 5,
    GOODBYE = 6,
    ERROR = 8,
    PUBLISH = 16,
    PUBLISHED = 17,
    SUBSCRIBE = 32,
    SUBSCRIBED = 33,
    UNSUBSCRIBE = 34,
    UNSUBSCRIBED = 35,
    EVENT = 36,
    CALL = 48,
    CANCEL = 49,
    RESULT = 50,
    REGISTER = 64,
    REGISTERED = 65,
    UNREGISTER = 66,
    UNREGISTERED = 67,
    INVOCATION = 68,
    INTERRUPT = 69,
    YIELD = 70,
}

function fromArray(data: any[]): Message {
    const a = data
    const type: MessageType = a.shift() as MessageType
    switch (type) {
        case MessageType.HELLO:
            return new HelloMessage(a[0], a[1])
        case MessageType.WELCOME:
            return new WelcomeMessage(a[0], a[1])
        case MessageType.ABORT:
            return new AbortMessage(a[0], a[1])
        case MessageType.CHALLENGE:
            return new ChallengeMessage(a[0], a[1])
        case MessageType.AUTHENTICATE:
            return new AuthenticateMessage(a[0], a[1])
        case MessageType.GOODBYE:
            return new GoodbyeMessage(a[0], a[1])
        case MessageType.ERROR:
            return new ErrorMessage(a[0], a[1], a[2], a[3])
        case MessageType.PUBLISH:
            return new PublishMessage(a[0], a[1], a[2])
        case MessageType.PUBLISHED:
            return new PublishedMessage(a[0], a[1])
        case MessageType.SUBSCRIBE:
            return new SubscribeMessage(a[0], a[1], a[2])
        case MessageType.SUBSCRIBED:
            return new SubscribedMessage(a[0], a[1])
        case MessageType.UNSUBSCRIBE:
            return new UnsubscribeMessage(a[0], a[1])
        case MessageType.UNSUBSCRIBED:
            return new UnsubscribedMessage(a[0], [1])
        case MessageType.EVENT:
            return new EventMessage(a[0], a[1], a[2], a[3], a[4])
        case MessageType.CALL:
            return new CallMessage(a[0], a[1], a[2], a[3], a[4])
        case MessageType.CANCEL:
            return new CancelMessage(a[0], a[1])
        case MessageType.RESULT:
            return new ResultMessage(a[0], a[1], a[2], a[3])
        case MessageType.REGISTER:
            return new RegisterMessage(a[0], a[1], a[2])
        case MessageType.REGISTERED:
            return new RegisteredMessage(a[0], a[1])
        case MessageType.UNREGISTER:
            return new UnregisterMessage(a[0], a[1])
        case MessageType.UNREGISTERED:
            return new UnregisteredMessage(a[0], a[1])
        case MessageType.INVOCATION:
            return new InvocationMessage(a[0], a[1], a[2], a[3], a[4])
        case MessageType.INTERRUPT:
            return new InterruptMessage(a[0], a[1])
        case MessageType.YIELD:
            return new YieldMessage(a[0], a[1], a[2], a[3])
        default:
            throw new Error(`unknown message type: ${type}`)
    }
}

function appendArgsKwArgs(m: TodoType, a: any[]): void {
    if (m.args !== undefined) {
        a.push(m.args)
        if (m.kwArgs !== undefined) {
            a.push(m.kwArgs)
        }
    } else if (m.kwArgs !== undefined) {
        a.push([])
        a.push(m.kwArgs)
    }
}

export class Message {
    static fromArray = fromArray
    protected _type: MessageType
    protected _args: any[]
    public constructor(type: MessageType, ...args: any) {
        this._type = type
        this._args = args
    }

    public getType(): MessageType {
        return this._type
    }

    public asArray(): any[] {
        return [this._type, ...this._args]
    }
}

export class ErrorMessage extends Message {
    constructor(
        errorType: MessageType,
        requestId: number,
        details: KwArgs,
        error: string,
        args?: Args,
        kwArgs?: KwArgs
    ) {
        super(
            MessageType.ERROR,
            errorType,
            requestId,
            details,
            error,
            args,
            kwArgs
        )
    }

    public get error_type(): MessageType {
        return this._args[0]
    }

    public get request_id(): number {
        return this._args[1]
    }

    public get details(): KwArgs {
        return this._args[2]
    }

    public get error(): string {
        return this._args[3]
    }

    public get args(): Nullable<Args> {
        return this._args[3]
    }

    public get kwArgs(): Nullable<KwArgs> {
        return this._args[4]
    }

    public asArray(): any[] {
        const a: any[] = [
            this._type,
            this.error_type,
            this.request_id,
            this.details,
            this.error,
        ]
        appendArgsKwArgs(this, a)
        return a
    }
}

export class HelloMessage extends Message {
    constructor(realm: string, details?: KwArgs) {
        super(MessageType.HELLO, realm, details)
    }

    public get realm(): string {
        return this._args[0]
    }

    public get details(): Nullable<KwArgs> {
        return this._args[1]
    }
}

export class WelcomeMessage extends Message {
    constructor(sessionId: number, details: KwArgs) {
        super(MessageType.WELCOME, sessionId, details)
    }

    public get session_id(): number {
        return this._args[0]
    }

    public get details(): KwArgs {
        return this._args[1]
    }
}

export class AbortMessage extends Message {
    constructor(details: KwArgs, reason: string) {
        super(MessageType.ABORT, details, reason)
    }

    public get details(): KwArgs {
        return this._args[0]
    }

    public get reason(): string {
        return this._args[1]
    }
}

export class ChallengeMessage extends Message {
    constructor(authmethod: string, extra?: KwArgs) {
        super(MessageType.CHALLENGE, authmethod, extra ?? {})
    }

    public get authmethod(): string {
        return this._args[0]
    }

    public get extra(): Nullable<KwArgs> {
        return this._args[1]
    }
}

export class AuthenticateMessage extends Message {
    constructor(signature: string, extra?: KwArgs) {
        super(MessageType.AUTHENTICATE, signature, extra)
    }

    public get signature(): string {
        return this._args[0]
    }

    public get extra(): Nullable<KwArgs> {
        return this._args[1]
    }
}

export class GoodbyeMessage extends AbortMessage {
    constructor(details: KwArgs, reason: string) {
        super(details, reason)
        this._type = MessageType.GOODBYE
    }
}

export class SubscribeMessage extends Message {
    constructor(requestId: number, options: KwArgs, topic: string) {
        super(MessageType.SUBSCRIBE, requestId, options, topic)
    }

    public get request_id(): number {
        return this._args[0]
    }

    public get options(): KwArgs {
        return this._args[1]
    }

    public get topic(): string {
        return this._args[2]
    }
}

export class SubscribedMessage extends Message {
    constructor(requestId: number, id: number) {
        super(MessageType.SUBSCRIBED, requestId, id)
    }

    public get request_id(): number {
        return this._args[0]
    }

    public get subscription_id(): number {
        return this._args[1]
    }
}

export class UnsubscribeMessage extends SubscribedMessage {
    constructor(requestId: number, id: number) {
        super(requestId, id)
        this._type = MessageType.UNSUBSCRIBE
    }
}

export class UnsubscribedMessage extends Message {
    constructor(requestId: number, details?: KwArgs) {
        super(MessageType.UNSUBSCRIBED, requestId, details)
    }

    public get request_id(): number {
        return this._args[0]
    }

    public get details(): Nullable<KwArgs> {
        if (this._args.length > 1) {
            return this._args[1]
        }
        return null
    }
}

export class PublishMessage extends Message {
    constructor(
        requestId: number,
        options: KwArgs,
        topic: string,
        args?: any[],
        kwArgs?: KwArgs
    ) {
        super(MessageType.PUBLISH, requestId, options, topic, args, kwArgs)
    }

    public get request_id(): number {
        return this._args[0]
    }

    public get options(): KwArgs {
        return this._args[1]
    }

    public get topic(): string {
        return this._args[2]
    }

    public get args(): Nullable<Args> {
        return this._args[3]
    }

    public get kwArgs(): Nullable<KwArgs> {
        return this._args[4]
    }

    public asArray(): any[] {
        const a: any[] = [this._type, this.request_id, this.options, this.topic]
        appendArgsKwArgs(this, a)
        return a
    }
}

export class PublishedMessage extends Message {
    constructor(requestId: number, id: number) {
        super(MessageType.PUBLISHED, requestId, id)
    }

    public get request_id(): number {
        return this._args[0]
    }

    public get publication_id(): number {
        return this._args[1]
    }
}

export class EventMessage extends Message {
    constructor(
        subscriptionId: number,
        publicationId: number,
        details: KwArgs,
        args?: any[],
        kwArgs?: KwArgs
    ) {
        super(
            MessageType.EVENT,
            subscriptionId,
            publicationId,
            details,
            args,
            kwArgs
        )
    }

    public get subscription_id(): number {
        return this._args[0]
    }

    public get publication_id(): number {
        return this._args[1]
    }

    public get details(): KwArgs {
        return this._args[2]
    }

    public get args(): any[] {
        return this._args[3]
    }

    public get kwArgs(): KwArgs {
        return this._args[4]
    }

    public asArray(): any[] {
        const a: any[] = [
            this._type,
            this.subscription_id,
            this.publication_id,
            this.details,
        ]
        appendArgsKwArgs(this, a)
        return a
    }
}

export class CallMessage extends Message {
    constructor(
        requestId: number,
        options: KwArgs,
        procedure: string,
        args?: any[],
        kwArgs?: KwArgs
    ) {
        super(MessageType.CALL, requestId, options, procedure, args, kwArgs)
    }

    public get request_id(): number {
        return this._args[0]
    }

    public get options(): KwArgs {
        return this._args[1]
    }

    public get procedure(): string {
        return this._args[2]
    }

    public get args(): Nullable<Args> {
        return this._args[3]
    }

    public get kwArgs(): Nullable<KwArgs> {
        return this._args[4]
    }

    public asArray(): any[] {
        const a: any[] = [
            this._type,
            this.request_id,
            this.options,
            this.procedure,
        ]
        appendArgsKwArgs(this, a)
        return a
    }
}

export class CancelMessage extends Message {
    constructor(requestId: number, options: KwArgs) {
        super(MessageType.CANCEL, requestId, options)
    }

    public get request_id(): number {
        return this._args[0]
    }

    public get options(): KwArgs {
        return this._args[1]
    }
}

export class ResultMessage extends Message {
    constructor(
        requestId: number,
        details: KwArgs,
        args?: any[],
        kwArgs?: KwArgs
    ) {
        super(MessageType.RESULT, requestId, details, args, kwArgs)
    }

    public get request_id(): number {
        return this._args[0]
    }

    public get details(): KwArgs {
        return this._args[1]
    }

    public get args(): Nullable<Args> {
        return this._args[2]
    }

    public get kwArgs(): Nullable<KwArgs> {
        return this._args[3]
    }
}

export class RegisterMessage extends Message {
    constructor(requestId: number, options: KwArgs, procedure: string) {
        super(MessageType.REGISTER, requestId, options, procedure)
    }

    public get request_id(): number {
        return this._args[0]
    }

    public get options(): KwArgs {
        return this._args[1]
    }

    public get procedure(): string {
        return this._args[2]
    }
}

export class RegisteredMessage extends Message {
    constructor(requestId: number, id: number) {
        super(MessageType.REGISTERED, requestId, id)
    }

    public get request_id(): number {
        return this._args[0]
    }

    public get registration_id(): number {
        return this._args[1]
    }
}

export class UnregisterMessage extends Message {
    constructor(requestId: number, registrationId: number) {
        super(MessageType.UNREGISTER, requestId, registrationId)
    }

    public get request_id(): number {
        return this._args[0]
    }

    public get registration_id(): number {
        return this._args[1]
    }
}

export class UnregisteredMessage extends Message {
    constructor(requestId: number, details?: KwArgs) {
        super(MessageType.UNREGISTERED, requestId, details)
    }

    public get request_id(): number {
        return this._args[0]
    }

    public get details(): Nullable<KwArgs> {
        if (this._args.length > 1) {
            return this._args[1]
        }
        return null
    }
}

export class InvocationMessage extends Message {
    constructor(
        requestId: number,
        registrationId: number,
        details: KwArgs,
        args?: any[],
        kwArgs?: KwArgs
    ) {
        super(
            MessageType.INVOCATION,
            requestId,
            registrationId,
            details,
            args,
            kwArgs
        )
    }

    public get request_id(): number {
        return this._args[0]
    }

    public get registration_id(): number {
        return this._args[1]
    }

    public get details(): KwArgs {
        return this._args[2]
    }

    public get args(): Nullable<Args> {
        return this._args[3]
    }

    public get kwArgs(): Nullable<KwArgs> {
        return this._args[4]
    }
}

export class InterruptMessage extends Message {
    constructor(requestId: number, options: KwArgs) {
        super(MessageType.INTERRUPT, requestId, options)
    }

    public get request_id(): number {
        return this._args[0]
    }

    public get options(): KwArgs {
        return this._args[1]
    }
}

export class YieldMessage extends Message {
    constructor(
        requestId: number,
        options: KwArgs,
        args?: Args,
        kwArgs?: KwArgs
    ) {
        super(MessageType.YIELD, requestId, options, args, kwArgs)
    }

    public get request_id(): number {
        return this._args[0]
    }

    public get options(): KwArgs {
        return this._args[1]
    }

    public get args(): Nullable<Args> {
        return this._args[2]
    }

    public get kwArgs(): Nullable<KwArgs> {
        return this._args[3]
    }

    public asArray(): any[] {
        const a: any[] = [this._type, this.request_id, this.options]
        appendArgsKwArgs(this, a)
        return a
    }
}
