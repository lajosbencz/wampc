import Serializer, { SerializerType } from '../serializer';

export class JsonSerializer implements Serializer {
    get type(): SerializerType {
        return SerializerType.Json;
    }
    get isBinary(): boolean {
        return false;
    }

    serialize(obj: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            try {
                resolve(JSON.stringify(obj));
            } catch (e) {
                reject(e);
            }
        });
    }

    unserialize(payload: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            try {
                resolve(JSON.parse(payload));
            } catch (e) {
                reject(e);
            }
        });
    }
}

export default new JsonSerializer();
