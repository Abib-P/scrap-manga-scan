import {Partner} from "../common/partner/partner";
import {Manga} from "../common/manga/manga";
import {Injectable} from "@nestjs/common";

@Injectable()
export class MangaService {
    constructor(private readonly partner: Partner) {
    }

    async search(mangaName: string): Promise<Manga[]> {
        return await this.partner.search(mangaName);
    }
}
