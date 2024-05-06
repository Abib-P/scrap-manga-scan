import {ComickManga} from "./comick_manga";
import {ComickMapper} from "./comick.mapper";
import {Manga} from "../common/manga/manga";
import {Partner} from "../common/partner/partner";
import {Injectable} from "@nestjs/common";

@Injectable()
export class Comick implements Partner {
    private static readonly API_URL = "https://api.comick.fun";

    constructor() {
        console.log("Comick created!");
    }

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
            .then(data => {
                return data as ComickManga[];
            })
            .then(mangas => {
                return mangas.sort(
                    (a, b) => b.rating_count - a.rating_count
                ).map(manga => ComickMapper.toManga(manga));
            });
    }

    async download(manga: Manga): Promise<Manga> {
        //mettre une priorité sur le téléchargement de "Official"
        throw new Error("Method not implemented.");
    }
}
