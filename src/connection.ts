import Deferred from './deferred';
import Client from './client';
import Features from './protocol/features';
import Message, { MessageType } from './protocol/message';
import {
    AbortMessage,
    AuthenticateMessage,
    CallMessage,
    CancelMessage,
    ChallengeMessage,
    ErrorMessage,
    EventMessage,
    GoodbyeMessage,
    HelloMessage,
    InvocationMessage,
    PublishedMessage,
    PublishMessage,
    RegisteredMessage,
    RegisterMessage,
    ResultMessage,
    SubscribedMessage,
    SubscribeMessage,
    UnregisteredMessage,
    UnregisterMessage,
    UnsubscribedMessage,
    UnsubscribeMessage,
    WelcomeMessage,
    YieldMessage,
} from './protocol/message_util';
import { asCancelablePromise, asPromise } from './util';
import { ProtocolType } from './protocol';
import { Transporter, TransportOptions, TransportOptionsDefaults } from './transport';
import type { Args, KwArgs, TodoType } from './types';
import Result from './protocol/result';
import Session from './protocol/session';
import WampError from './protocol/error';
import WampEvent from './protocol/event';
import Subscription from './protocol/subscription';
import Publication from './protocol/publication';
import Registration from './protocol/registration';
import WampInvocation from './protocol/invocation';

export async function transportFromUri(uri: string, opts?: TransportOptions): Promise<Transporter> {
    opts = opts ?? TransportOptionsDefaults;
    opts.url = uri;
    let scheme = 'ws';
    if (uri.match(/^[a-z0-9]+:\/\//i) != null) {
        scheme = uri.split('://')[0];
    }
    let T;
    switch (scheme) {
        case 'ws':
        case 'http':
            T = (await import('./transport/websocket.js')).default;
            break;
        case 'tcp':
            if (typeof window !== 'undefined') {
                throw new Error('RawSocket must be run with NodeJS');
            }
            T = (await import('./transport/rawsocket.js')).default;
            break;
        default:
            throw Error('unknown url scheme: ' + scheme);
    }
    return new T(opts);
}

export interface ConnectionOptions {
    protocols?: ProtocolType[];
    authid?: string;
    authmethods?: string[];
    onchallenge?: (c: Connection, authmethod: string, extra?: KwArgs) => any|Promise<any>;
    caller_disclose_me?: boolean;
    publisher_disclose_me?: boolean;
}

export const ConnectionOptionsDefaults = {
    protocols: [ProtocolType.Wamp2Json],
    caller_disclose_me: true,
    publisher_disclose_me: true,
};

export default class Connection {
    protected _url: string;
    protected _client: Client;
    protected _options: ConnectionOptions;
    protected _transport?: Transporter;
    protected _opened: boolean = false;
    protected _joined: boolean = false;
    protected _features: KwArgs = {};
    protected _prefixes: Map<string, string> = new Map();
    protected _session: Session;
    protected _deferred_session: Deferred<Session>;
    protected _goodbye_sent: boolean = false;
    protected _subscribe_reqs: Map<number, TodoType> = new Map();
    protected _unsubscribe_reqs: Map<number, TodoType> = new Map();
    protected _publish_reqs: Map<number, TodoType> = new Map();
    protected _register_reqs: Map<number, TodoType> = new Map();
    protected _unregister_reqs: Map<number, TodoType> = new Map();
    protected _call_reqs: Map<number, TodoType> = new Map();
    protected _subscriptions: Map<number, Subscription[]> = new Map();
    protected _registrations: Map<number, Registration> = new Map();
    protected _deferred_leave?: Deferred<any>;

    constructor(client: Client, url: string, realm: string, options?: ConnectionOptions) {
        this._client = client;
        this._url = url;
        this._options = Object.assign({}, ConnectionOptionsDefaults, options ?? {});
        this._deferred_session = new Deferred<Session>();
        this._session = new Session(realm, -1);
    }

    public get options(): ConnectionOptions {
        return this._options;
    }

    public get transport(): Transporter {
        if (this._transport == null) {
            throw new Error('transport unavailable');
        }
        return this._transport;
    }

    public get session(): Session {
        return this._session;
    }

    protected _assignFeatures(f: KwArgs): void {
        if ('broker' in f.roles) {
            // "Basic Profile" is mandatory
            this._features.subscriber = {};
            this._features.publisher = {};
            // fill in features that both peers support
            if ('features' in f.roles.broker) {
                for (const att in Features.publisher.features) {
                    this._features.publisher[att] =
                        (Features.publisher.features[att] && f.roles.broker.features[att]) || false;
                }
                for (const att in Features.subscriber.features) {
                    // const b = Features.subscriber.features[0]
                    this._features.subscriber[att] =
                        (Features.subscriber.features[att] && f.roles.broker.features[att]) || false;
                }
            }
        }
        if ('dealer' in f.roles) {
            // "Basic Profile" is mandatory
            this._features.caller = {};
            this._features.callee = {};
            // fill in features that both peers support
            if ('features' in f.roles.dealer) {
                for (const att in Features.caller.features) {
                    this._features.caller[att] =
                        (Features.caller.features[att] && f.roles.dealer.features[att]) || false;
                }
                for (const att in Features.callee.features) {
                    this._features.callee[att] =
                        (Features.callee.features[att] && f.roles.dealer.features[att]) || false;
                }
            }
        }
    }

    protected _protocol_violation(reason: string): void {
        const err = Error('failing transport due to protocol violation: ' + reason);
        console.error(err);
        this.transport.close(3002, 'protocol violation: ' + reason).catch(console.error);
        // util.handle_error(self._on_internal_error, Error("failing transport due to protocol violation: " + reason))
    }

    protected _processWelcome(msg: WelcomeMessage): void {
        this._session.id = msg.session_id;
        this._assignFeatures(msg.details);
        this.onJoin(msg.details);
        this._deferred_session.resolve(this._session);
    }

    protected _processAbort(msg: AbortMessage): void {
        this.onLeave(msg.reason, msg.details);
    }

    protected async _processChallenge(msg: ChallengeMessage): Promise<void> {
        const onchallenge = this._options.onchallenge;
        if (onchallenge != null) {
            try {
                const signature = await onchallenge(this, msg.authmethod, msg.extra);
                let authMsg: AuthenticateMessage;
                if (typeof signature === 'string') {
                    authMsg = new AuthenticateMessage(signature, {});
                } else {
                    // if (typeof signature === 'object') {
                    authMsg = new AuthenticateMessage(signature[0], signature[1]);
                }
                await this.send(authMsg);
            } catch (e) {
                console.error('onchallenge() raised: ', e);
                const aborMsg = new AbortMessage(
                    {
                        message: 'sorry, I cannot authenticate (onchallenge handler raised an exception)',
                    },
                    'wamp.error.cannot_authenticate',
                );
                await this.send(aborMsg);
                await this.close(3000, '');
            }
        } else {
            const err = new Error('received WAMP challenge, but no onchallenge() handler set');
            console.error(err);
            await this.send(
                new AbortMessage(
                    {
                        message: 'sorry, I cannot authenticate (no onchallenge handler set)',
                    },
                    'wamp.error.cannot_authenticate',
                ),
            );
            await this.close(3000, '');
        }
    }

    protected async _processGoodbye(msg: GoodbyeMessage): Promise<void> {
        if (!this._goodbye_sent) {
            const byeMsg = new GoodbyeMessage({}, 'wamp.error.goodbye_and_out');
            await this.send(byeMsg);
        }
        this._session.id = -1;
        this._client.onLeave(msg.reason, msg.details);
        this._deferred_leave?.resolve(msg.reason);
    }

    protected _processError(msg: ErrorMessage): void {
        let reqs: Map<number, any>;
        switch (msg.error_type) {
            case MessageType.SUBSCRIBE:
                reqs = this._subscribe_reqs;
                break;
            case MessageType.UNSUBSCRIBE:
                reqs = this._unsubscribe_reqs;
                break;
            case MessageType.PUBLISH:
                reqs = this._publish_reqs;
                break;
            case MessageType.REGISTER:
                reqs = this._register_reqs;
                break;
            case MessageType.UNREGISTER:
                reqs = this._unregister_reqs;
                break;
            case MessageType.CALL:
                reqs = this._call_reqs;
                break;
            default:
                throw Error(`unknown error type: ${msg.error_type}`);
        }
        const requestId = msg.request_id;
        if (reqs.has(requestId)) {
            const err = new Error(msg.error);
            const [d] = reqs.get(requestId);
            d.reject(err);
            reqs.delete(requestId);
        } else {
            this._protocol_violation(`ERROR received for ${msg.error_type} request ID ${requestId}`);
        }
    }

    protected _processResult(msg: ResultMessage): void {
        const requestId = msg.request_id;
        if (this._call_reqs.has(requestId)) {
            const details = msg.details;
            const args = msg.args ?? [];
            const kwArgs = msg.kwArgs ?? {};

            let result = null;
            if (args.length > 1 || Object.keys(kwArgs).length > 0) {
                // wrap complex result is more than 1 positional result OR
                // non-empty keyword result
                result = new Result(args, kwArgs);
            } else if (args.length > 0) {
                // single positional result
                result = args[0];
            }
            const [d, options] = this._call_reqs.get(requestId);
            if (details.progress) {
                if (options?.receive_progress) {
                    d.notify(result);
                }
            } else {
                d.resolve(result);
                this._call_reqs.delete(requestId);
            }
        } else {
            this._protocol_violation(`CALL-RESULT received for non-pending request ID ${requestId}`);
        }
    }

    protected _processSubscribed(msg: SubscribedMessage): void {
        const requestId = msg.request_id;
        const subscriptionId = msg.subscription_id;
        if (this._subscribe_reqs.has(requestId)) {
            const [d, topic, handler, options] = this._subscribe_reqs.get(requestId);
            if (!this._subscriptions.has(subscriptionId)) {
                this._subscriptions.set(subscriptionId, []);
            }
            const sub = new Subscription(topic, handler, options, this, subscriptionId);
            this._subscriptions.get(subscriptionId)?.push(sub);
            d.resolve(sub);
            this._subscribe_reqs.delete(requestId);
        } else {
            this._protocol_violation(`SUBSCRIBED received for non-pending request ID ${requestId}`);
        }
    }

    protected _processUnsubscribed(msg: UnsubscribedMessage): void {
        const requestId: number = msg.request_id;
        if (this._unsubscribe_reqs.has(requestId)) {
            const [d, subscriptionId] = this._unsubscribe_reqs.get(requestId);
            if (this._subscriptions.has(subscriptionId)) {
                const subs = this._subscriptions.get(subscriptionId) ?? [];
                for (const sub of subs) {
                    sub.active = false;
                    sub.resolve();
                }
                this._subscriptions.delete(subscriptionId);
            }
            d.resolve(true);
            this._unsubscribe_reqs.delete(requestId);
        } else {
            if (requestId === 0) {
                // router actively revoked our subscription
                console.warn('router actively revoked our subscription');
                const details = msg.details;
                if (details != null) {
                    const subscriptionId: number = details.subscription as number;
                    const reason = details.reason;
                    if (this._subscriptions.has(subscriptionId)) {
                        const subs = this._subscriptions.get(subscriptionId) ?? [];
                        for (const sub of subs) {
                            sub.active = false;
                            sub.resolve(reason);
                        }
                        this._subscriptions.delete(subscriptionId);
                    } else {
                        this._protocol_violation(
                            `non-voluntary UNSUBSCRIBED received for non-existing subscription ID ${subscriptionId}`,
                        );
                    }
                }
            } else {
                this._protocol_violation(`UNSUBSCRIBED received for non-pending request ID ${requestId}`);
            }
        }
    }

    protected _processPublished(msg: PublishedMessage): void {
        const requestId = msg.request_id;
        const publicationId = msg.publication_id;
        if (this._publish_reqs.has(requestId)) {
            const [d] = this._publish_reqs.get(requestId);
            const pub = new Publication(publicationId);
            d.resolve(pub);
            this._publish_reqs.delete(requestId);
        } else {
            this._protocol_violation(`PUBLISHED received for non-pending request ID ${requestId}`);
        }
    }

    protected _processEvent(msg: EventMessage): void {
        const subscriptionId = msg.subscription_id;
        if (this._subscriptions.has(subscriptionId)) {
            const publicationId = msg.publication_id;
            const details = msg.details;
            const args = msg.args ?? [];
            const kwArgs = msg.kwArgs ?? {};
            const subs = this._subscriptions.get(subscriptionId) ?? [];
            const evt = new WampEvent(
                publicationId,
                details.topic ?? subs[0]?.topic,
                details.publisher,
                details.publisher_authid,
                details.publisher_authrole,
                details.retained ?? false,
                details.forward_for,
            );
            for (let i = 0; i < subs.length; i++) {
                const sub = subs[i];
                try {
                    sub.handler(args, kwArgs, evt, sub);
                } catch (e) {
                    console.error(e);
                }
            }
        } else {
            this._protocol_violation(`EVENT received for non-subscribed subscription ID ${subscriptionId}`);
        }
    }

    protected _processRegistered(msg: RegisteredMessage): void {
        const requestId = msg.request_id;
        const registrationId = msg.registration_id;
        if (this._register_reqs.has(requestId)) {
            const [d, procedure, endpoint, options] = this._register_reqs.get(requestId);
            const reg = new Registration(procedure, endpoint, options, this, registrationId);
            this._registrations.set(registrationId, reg);
            d.resolve(reg);
            this._register_reqs.delete(requestId);
        } else {
            this._protocol_violation(`REGISTERED received for non-pending request ID ${requestId}`);
        }
    }

    protected _processUnregistered(msg: UnregisteredMessage): void {
        const requestId = msg.request_id;
        if (this._unregister_reqs.has(requestId)) {
            const [d, registration] = this._unregister_reqs.get(requestId);
            if (this._registrations.has(registration.id)) {
                this._registrations.delete(registration.id);
            }
            registration.active = false;
            d.resolve();
            this._unregister_reqs.delete(requestId);
        } else {
            if (requestId === 0) {
                // the router actively revoked our registration
                console.warn('router actively revoked our registration');
                const details = msg.details;
                if (details != null) {
                    const registrationId: number = details.registration as number;
                    const reason = details.reason;
                    if (this._registrations.has(registrationId)) {
                        const registration = this._registrations.get(registrationId) as Registration;
                        registration.active = false;
                        registration.resolve(reason);
                        this._registrations.delete(registrationId);
                    } else {
                        this._protocol_violation(
                            `non-voluntary UNREGISTERED received for non-existing registration ID ${registrationId}`,
                        );
                    }
                }
            } else {
                this._protocol_violation(`UNREGISTERED received for non-pending request ID ${requestId}`);
            }
        }
    }

    protected async _processInvocation(msg: InvocationMessage): Promise<void> {
        const requestId = msg.request_id;
        const registrationId = msg.registration_id;
        const details = msg.details;
        if (this._registrations.has(registrationId)) {
            const reg = this._registrations.get(registrationId) as Registration;
            const args = msg.args;
            const kwArgs = msg.kwArgs;
            let progress = null;
            if (details?.receive_progress === true) {
                progress = async (args?: Args, kwArgs?: KwArgs) => {
                    const msgYield = new YieldMessage(requestId, { progress: true }, args, kwArgs);
                    await this.send(msgYield);
                };
            }
            const inv = new WampInvocation(
                details.procedure ?? reg.procedure,
                progress,
                details.caller,
                details.caller_authid,
                details.caller_authrole,
            );
            try {
                const res = await asPromise(reg.endpoint, args, kwArgs, inv);
                let yieldArgs;
                let yieldKwArgs;
                if (res instanceof Result) {
                    yieldArgs = res.args;
                    yieldKwArgs = res.kwArgs;
                } else if (typeof res === 'object' && ('args' in res || 'kwArgs' in res)) {
                    yieldArgs = res.args;
                    yieldKwArgs = res.kwArgs;
                } else if (Array.isArray(res)) {
                    yieldArgs = res;
                } else if (typeof res === 'object') {
                    yieldKwArgs = res;
                } else {
                    yieldArgs = [res];
                }
                const msgYield = new YieldMessage(requestId, {}, yieldArgs, yieldKwArgs);
                await this.send(msgYield);
            } catch (e) {
                let err;
                if (!(e instanceof WampError)) {
                    console.error(e);
                } else {
                    err = e;
                }
                const msgError = new ErrorMessage(
                    MessageType.INVOCATION,
                    requestId,
                    {},
                    err?.error ?? 'wamp.error.runtime_error',
                    err?.args ?? [],
                    err?.kwArgs,
                );
                await this.send(msgError);
                console.error('Exception raised in invocation handler:', err);
            }
        } else {
            this._protocol_violation(`INVOCATION received for non-registered registration ID ${requestId}`);
        }
    }

    protected async _processMessage(msg: Message): Promise<void> {
        if (this._session.id < 1) {
            switch (msg.getType()) {
                case MessageType.WELCOME:
                    this._processWelcome(msg as WelcomeMessage);
                    break;
                case MessageType.ABORT:
                    this._processAbort(msg as AbortMessage);
                    break;
                case MessageType.CHALLENGE:
                    await this._processChallenge(msg as ChallengeMessage);
                    break;
                default:
                    this._protocol_violation(`unexpected message type ${msg.getType()}`);
                    break;
            }
        } else {
            switch (msg.getType()) {
                case MessageType.GOODBYE:
                    this._processGoodbye(msg as GoodbyeMessage);
                    break;
                case MessageType.ERROR:
                    this._processError(msg as ErrorMessage);
                    break;
                case MessageType.SUBSCRIBED:
                    this._processSubscribed(msg as SubscribedMessage);
                    break;
                case MessageType.UNSUBSCRIBED:
                    this._processUnsubscribed(msg as UnsubscribedMessage);
                    break;
                case MessageType.PUBLISHED:
                    this._processPublished(msg as PublishedMessage);
                    break;
                case MessageType.REGISTERED:
                    this._processRegistered(msg as RegisteredMessage);
                    break;
                case MessageType.UNREGISTERED:
                    this._processUnregistered(msg as UnregisteredMessage);
                    break;
                case MessageType.EVENT:
                    this._processEvent(msg as EventMessage);
                    break;
                case MessageType.INVOCATION:
                    await this._processInvocation(msg as InvocationMessage);
                    break;
                case MessageType.RESULT:
                    this._processResult(msg as ResultMessage);
                    break;
                default:
                    this._protocol_violation(`unexpected message type ${msg.getType()}`);
                    break;
            }
        }
    }

    public onJoin(details: KwArgs): void {
        this._joined = true;
        this._client.onJoin(details);
    }

    public onLeave(reason: string, details: KwArgs): void {
        this._client.onLeave(reason, details);
        this._joined = false;
    }

    public async getSession(): Promise<Session> {
        return await this._deferred_session.promise;
    }

    public async tryOpen(): Promise<boolean> {
        if (this._opened) return false;
        await this.open();
        await this.getSession();
        return true;
    }

    public async open(): Promise<Event> {
        this._joined = false;
        const transportOptions = Object.assign({}, TransportOptionsDefaults, {
            url: this._url,
            protocols: this._options?.protocols,
        });
        this._transport = await transportFromUri(transportOptions.url, transportOptions);
        this._transport.onMessage = async (msg: Message) => {
            // console.log(msg);
            await this._processMessage(msg);
        };
        const evtOpen = await this.transport.open();
        this._opened = true;
        const msg = new HelloMessage(this._session.realm, {
            roles: Features,
            authmethods: this._options.authmethods,
            authid: this._options.authid,
        });
        await this.send(msg);
        return evtOpen;
    }

    public async close(code?: number, reason?: string): Promise<CloseEvent> {
        code = code ?? 0;
        reason = reason ?? 'wamp.close.normal';
        this._deferred_session = new Deferred<Session>();
        this._opened = false;
        return await this.transport.close(code, reason);
    }

    public async send(msg: Message): Promise<void> {
        // console.log(msg);
        await this.transport.send(msg.asArray());
    }

    public async leave(reason?: string, message?: string): Promise<string> {
        reason = reason ?? 'wamp.close.close_realm';
        const details: KwArgs = {};
        if (message !== undefined) {
            details.message = message;
        }
        const msg = new GoodbyeMessage(details, reason);
        await this.send(msg);
        this._goodbye_sent = true;
        this._deferred_leave = new Deferred<string>();
        return await this._deferred_leave.promise;
    }

    public async call(rpc: string, args?: Args, kwArgs?: KwArgs, options?: KwArgs): Promise<Result> {
        options = options ?? {};
        if (options.disclose_me === undefined && this._options.caller_disclose_me) {
            options.disclose_me = true;
        }
        await this.tryOpen();
        const session = await this.getSession();
        const requestId = session.nextId();
        const d = new Deferred<any>();
        this._call_reqs.set(requestId, [d, options]);
        const msg = new CallMessage(requestId, options, rpc, args, kwArgs);
        await this.send(msg);
        const promise = asCancelablePromise(d.promise);
        promise.cancel = async (cancelOptions?: KwArgs): Promise<void> => {
            const msg = new CancelMessage(requestId, cancelOptions ?? {});
            await this.send(msg);
            if (
                this._call_reqs.has(requestId) &&
                (cancelOptions == null || !('mode' in cancelOptions) || cancelOptions.mode !== 'kill')
            ) {
                // When the mode is not 'kill' it will never receive a call result.
                // So when the request was still in the list, reject and remove it.
                const cancelledDefer = this._call_reqs.get(requestId)[0];
                cancelledDefer.reject(new Error('Cancelled'));
                this._call_reqs.delete(requestId);
            }
        };
        return promise.promise;
    }

    public async publish(topic: string, args?: Args, kwArgs?: KwArgs, options?: KwArgs): Promise<Publication | void> {
        options = options ?? {};
        if (options.disclose_me === undefined && this._options.publisher_disclose_me) {
            options.disclose_me = true;
        }
        await this.tryOpen();
        const session = await this.getSession();
        const requestId = session.nextId();
        let d;
        if (options.acknowledge) {
            d = new Deferred<Publication>();
            this._publish_reqs.set(requestId, [d, options]);
        }
        const msg = new PublishMessage(requestId, options, this.resolve(topic), args, kwArgs);
        this.send(msg);
        if (d != null) {
            return await d.promise;
        }
    }

    public async subscribe(topic: string, handler: TodoType, options?: KwArgs): Promise<Subscription> {
        options = options ?? {};
        await this.tryOpen();
        const session = await this.getSession();
        const requestId = session.nextId();
        const d = new Deferred<Subscription>();
        this._subscribe_reqs.set(requestId, [d, topic, handler, options]);
        const msg = new SubscribeMessage(requestId, options, topic);
        this.send(msg);
        return await d.promise;
    }

    public async register(procedure: string, endpoint: TodoType, options?: KwArgs): Promise<Registration> {
        options = options ?? {};
        await this.tryOpen();
        const session = await this.getSession();
        const requestId = session.nextId();
        const d = new Deferred<Registration>();
        this._register_reqs.set(requestId, [d, procedure, endpoint, options]);
        const msg = new RegisterMessage(requestId, options, this.resolve(procedure));
        this.send(msg);
        return await d.promise;
    }

    public async unsubscribe(subscription: Subscription): Promise<boolean> {
        if (!this._subscriptions.has(subscription.id)) {
            throw new Error('subscription not active');
        }
        const subs = this._subscriptions.get(subscription.id) ?? [];
        const i = subs.indexOf(subscription);
        const remove = (): void => {
            if (i >= 0) {
                subs.splice(i, 1);
                subscription.active = false;
            }
        };
        if (!this._joined) {
            remove();
            throw new Error('session not open');
        }

        if (!subscription.active || !this._subscriptions.has(subscription.id)) {
            remove();
            throw new Error('subscription not active');
        }

        if (i < 0) {
            throw new Error('subscription not active');
        }
        remove();

        const d = new Deferred<boolean>();
        if (subs.length > 0) {
            d.resolve(false);
        } else {
            await this.tryOpen();
            const session = await this.getSession();
            const requestId = session.nextId();
            this._unsubscribe_reqs.set(requestId, [d, subscription.id]);
            const msg = new UnsubscribeMessage(requestId, subscription.id);
            this.send(msg);
        }

        return await d.promise;
    }

    public async unregister(registration: TodoType): Promise<void> {
        if (!registration.active || !this._registrations.has(registration.id)) {
            throw new Error('registration not active');
        }
        await this.tryOpen();
        const session = await this.getSession();
        const requestId = session.nextId();
        const d = new Deferred<void>();
        this._unregister_reqs.set(requestId, [d, registration]);
        const msg = new UnregisterMessage(requestId, registration.id);
        this.send(msg);
        return await d.promise;
    }

    public prefix(prefix: string, uri?: string): void {
        if (uri !== undefined) {
            this._prefixes.set(prefix, uri);
        } else {
            if (prefix in this._prefixes) {
                this._prefixes.delete(prefix);
            }
        }
    }

    public resolve(curie: string): string {
        // skip if not a CURIE
        const i = curie.indexOf(':');
        if (i >= 0) {
            const prefix = curie.substring(0, i);
            if (this._prefixes.has(prefix)) {
                return (this._prefixes.get(prefix) as string) + '.' + curie.substring(i + 1);
            } else {
                return curie;
            }
        } else {
            return curie;
        }
    }
}
