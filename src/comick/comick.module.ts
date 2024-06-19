import {Module} from '@nestjs/common';
import {ComickPartner} from "./comick-partner.service";
import {Partner} from "../common/partner/partner";

@Module({
    providers: [
        {
            provide: Partner,
            useClass: ComickPartner,
        }
    ],
    exports : [Partner]
})
export class ComickModule {
}
