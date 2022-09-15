export default class Session {
    protected _nextId = 0;
    public realm: string;
    public id: number;
    constructor(realm: string, id: number) {
        this.realm = realm;
        this.id = id;
    }

    public nextId(): number {
        this._nextId++;
        return this._nextId;
    }
}
