// file exists to avoid circular dependency
import Message, { MessageType } from './message'
import HelloMessage from './message/hello'
import WelcomeMessage from './message/welcome'
import AbortMessage from './message/abort'
import ChallengeMessage from './message/challenge'
import AuthenticateMessage from './message/authenticate'
import GoodbyeMessage from './message/goodbye'
import ErrorMessage from './message/error'
import PublishMessage from './message/publish'
import PublishedMessage from './message/published'
import SubscribeMessage from './message/subscribe'
import SubscribedMessage from './message/subscribed'
import UnsubscribeMessage from './message/unsubscribe'
import UnsubscribedMessage from './message/unsubscribed'
import EventMessage from './message/event'
import CallMessage from './message/call'
import CancelMessage from './message/cancel'
import ResultMessage from './message/result'
import RegisterMessage from './message/register'
import RegisteredMessage from './message/registered'
import UnregisterMessage from './message/unregister'
import UnregisteredMessage from './message/unregistered'
import InvocationMessage from './message/invocation'
import InterruptMessage from './message/interrupt'
import YieldMessage from './message/yield'

export {
    AbortMessage,
    AuthenticateMessage,
    CallMessage,
    CancelMessage,
    ChallengeMessage,
    ErrorMessage,
    EventMessage,
    GoodbyeMessage,
    HelloMessage,
    InterruptMessage,
    InvocationMessage,
    PublishMessage,
    PublishedMessage,
    RegisterMessage,
    RegisteredMessage,
    ResultMessage,
    SubscribeMessage,
    SubscribedMessage,
    UnregisterMessage,
    UnregisteredMessage,
    UnsubscribeMessage,
    UnsubscribedMessage,
    WelcomeMessage,
    YieldMessage,
}

export function MessageFromArray(data: any[]): Message {
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
