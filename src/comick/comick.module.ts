import {Module} from '@nestjs/common';
import {Comick} from "./comick";
import {Partner} from "../common/partner/partner";

@Module({
    providers: [
        {
            provide: Partner,
            useClass: Comick,
        }
    ],
    exports : [Partner]
})
export class ComickModule {
}
