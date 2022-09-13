export default class Event {
    publication: any
    topic: string = ''
    publisher: any
    publisher_authid: string = ''
    publisher_authrole: string = ''
    retained: any
    forward_for: any

    constructor(
        publication: any,
        topic: string,
        publisher: any,
        publisher_authid: string,
        publisher_authrole: string,
        retained: any,
        forward_for: any
    ) {
        this.publication = publication
        this.topic = topic
        this.publisher = publisher
        this.publisher_authid = publisher_authid
        this.publisher_authrole = publisher_authrole
        this.retained = retained
        this.forward_for = forward_for
    }
}
