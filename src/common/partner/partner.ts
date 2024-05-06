import {Manga} from "../manga/manga";

export abstract class Partner {
    abstract search(mangaName: string): Promise<Manga[]>;

    abstract download(manga: Manga): Promise<Manga>;
}
