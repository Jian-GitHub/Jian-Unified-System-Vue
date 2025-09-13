export type User = {
    id: string;
    email: string;
    info: InfoOptions;
    security: SecurityOptions
}

export type Date = {
    year: string;
    month: string;
    day: string;
}

type ThirdPartyAccount = {
    github: boolean;
    google: boolean;
}

type SecurityOptions = {
    contacts: string[];
    passwordUpdatedDate: Date
    accountSecurityTokenNum: number;
    notificationEmail: string;
    passkeysNum: number;
    thirdPartyAccounts: ThirdPartyAccount;
}

type Name = {
    givenName: string;
    middleName: string;
    familyName: string;
}

type InfoOptions = {
    name: Name;
    birthday: Date
    countryRegion: string;
    language: string;
}
