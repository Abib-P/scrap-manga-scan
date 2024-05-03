export enum Partners {
    COMICK = 'COMICK',
}

interface IPartnerInfo {
    partnerId: Partners;
    partnerCode: string;
}

export class PartnerInfo {
    partnerId: Partners;
    partnerCode: string;

    constructor(partnerInfo: IPartnerInfo) {
        this.partnerId = partnerInfo.partnerId;
        this.partnerCode = partnerInfo.partnerCode;
    }
}
