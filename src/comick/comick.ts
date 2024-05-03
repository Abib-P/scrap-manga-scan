import {ComickManga} from "./comick_manga";
import {ComickMapper} from "./comick_mapper";
import {Manga} from "../core/manga/manga";
import {Partner} from "../core/partner/partner";

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

        return await fetch( Comick.API_URL + query, options)
            .then(response => response.json())
            .then(data => {
                return data as ComickManga[];
            })
            .then(mangas => {
                return mangas.map(manga => ComickMapper.toManga(manga));
            });
    }

    async download(manga: Manga): Promise<Manga> {
        //mettre une priorité sur le téléchargement de "Official"
        throw new Error("Method not implemented.");
    }
}
