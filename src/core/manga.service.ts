import {Partner} from "../common/partner/partner";
import {Manga} from "../common/manga/manga";
import {Injectable} from "@nestjs/common";
import {PartnerInfo} from "../common/partner/partner_info";

@Injectable()
export class MangaService {
    constructor(private readonly partner: Partner) {
    }

    async search(mangaName: string): Promise<Manga[]> {
        return await this.partner.search(mangaName);
    }

    async download(partnerInfo: PartnerInfo): Promise<Manga> {
        return await this.partner.download(partnerInfo);
    }

    async updateAll() {
        return await this.partner.updateAll();
    }
}
