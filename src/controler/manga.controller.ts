import {Controller, Get} from "@nestjs/common";
import {MangaService} from "../core/manga.service";
import {MangaDto} from "./dto/manga.dto";

@Controller('manga')
export class MangaController {
    constructor(private readonly mangaService: MangaService) {
        console.log("MangaController created!");
    }

    @Get()
    async search(): Promise<MangaDto[]> {
        return await this.mangaService.search('one piece').then(
            mangas => mangas.map(manga => new MangaDto(
                {
                    mangaId: manga.mangaId.id,
                    partnersInfo: manga.partnersInfo,
                    MangaTitle: manga.MangaTitle,
                    MangaCoverUrl: manga.MangaCoverUrl
                }
            ))
        );
    }
}
