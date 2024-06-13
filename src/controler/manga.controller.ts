import {Body, Controller, Get, Param} from "@nestjs/common";
import {MangaService} from "../core/manga.service";
import {MangaDto} from "./dto/manga.dto";
import {PartnerInfo, Partners} from "../common/partner/partner_info";
import {PartnerInfoDto} from "./dto/partner_info.dto";

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
                    },
                ),
            ),
        );
    }

    @Get("download")
    async download(@Body() partnerInfo: PartnerInfoDto): Promise<MangaDto> {
        console.log(partnerInfo)
        return await this.mangaService.download(
            new PartnerInfo(
                {
                    partnerId: Partners[partnerInfo.partnerId],
                    partnerCode: partnerInfo.partnerCode
                },
            ),
        ).then(
            manga => new MangaDto(
                {
                    mangaId: manga.mangaId ? manga.mangaId.id : null,
                    partnersInfo: manga.partnersInfo,
                    MangaTitle: manga.MangaTitle,
                    MangaCoverUrl: manga.MangaCoverUrl
                },
            ),
        );
    }

    @Get("updateAll")
    async updateAll(): Promise<void> {
        return await this.mangaService.updateAll();
    }
}
