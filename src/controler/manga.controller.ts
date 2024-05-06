import {Controller, Get, Param} from "@nestjs/common";
import {MangaService} from "../core/manga.service";
import {MangaDto} from "./dto/manga.dto";

@Controller('manga')
export class MangaController {
    constructor(private readonly mangaService: MangaService) {
    }

    @Get("search/:mangaName")
    async search(@Param('mangaName') mangaName: string): Promise<MangaDto[]> {
        return await this.mangaService.search(mangaName).then(
            mangas => mangas.map(
                manga => new MangaDto(
                    {
                        mangaId: manga.mangaId ? manga.mangaId.id : null,
                        partnersInfo: manga.partnersInfo,
                        MangaTitle: manga.MangaTitle,
                        MangaCoverUrl: manga.MangaCoverUrl
                    }
                ),
            ),
        );
    }
}
