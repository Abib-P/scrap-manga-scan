import { Module } from '@nestjs/common';
import {ControllerModule} from "./controler/controller.module";
import {CoreModule} from "./core/core.module";
import {ComickModule} from "./comick/comick.module";


@Module({
    imports: [ControllerModule, CoreModule, ComickModule],
})
export class AppModule {}
