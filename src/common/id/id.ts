export class Id {
    id: String;

    constructor(id: String) {
        if (id === null || id === undefined) {
            throw new Error('id is required');
        }
        this.id = id;
    }
}
