import {Module} from "@nestjs/common";
import {MangaService} from "./manga.service";
import {ComickModule} from "../comick/comick.module";

@Module({
    imports: [ComickModule],
    providers: [MangaService],
    exports: [MangaService]
})
export class CoreModule {}
