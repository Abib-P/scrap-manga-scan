import {ComickManga} from "./comick_manga";
import {ComickMapper} from "./comick.mapper";
import {Manga} from "../common/manga/manga";
import {Partner} from "../common/partner/partner";
import {Injectable} from "@nestjs/common";
import { PartnerInfo } from "src/common/partner/partner_info";

@Injectable()
export class Comick implements Partner {
    private static readonly API_URL = "https://api.comick.fun";

    async search(mangaName: string): Promise<Manga[]> {
        const query = '/v1.0/search/?page=1&limit=8&showall=false&q=' + mangaName;
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        };

        return await fetch(Comick.API_URL + query, options)
            .then(response => response.json())
            .then(
                data => {
                    return data as ComickManga[];
                },
            ).then(
                mangas => {
                    return mangas.sort(
                        (a, b) => b.rating_count - a.rating_count
                    ).map(manga => ComickMapper.toManga(manga));
                },
            );
    }


    async download(partnerInfo: PartnerInfo): Promise<Manga> {
        //priorisé le group name "Official" si il existe sinon le premier
        //ne pas prendre les chap=null

        throw new Error("Method not implemented.");
    }
}
