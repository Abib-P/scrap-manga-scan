import { Module } from '@nestjs/common';
import { MangaController } from './manga.controller';
import {CoreModule} from "../core/core.module";

@Module({
    imports: [CoreModule],
    controllers: [MangaController],
})
export class ControllerModule {}
