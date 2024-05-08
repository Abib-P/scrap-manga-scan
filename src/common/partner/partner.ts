import {Manga} from "../manga/manga";
import {PartnerInfo} from "./partner_info";

export abstract class Partner {
    abstract search(mangaName: string): Promise<Manga[]>;

    abstract download(partnerInfo: PartnerInfo): Promise<Manga>;
}
