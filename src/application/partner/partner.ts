import {Manga} from "../manga/manga";

export interface Partner {
    search(mangaName: string): Promise<Manga[]>;
    download(manga: Manga): Promise<Manga>;
}
