export type User = {
    id: string;
    avatar: string;
    info: InfoOptions;
    security: SecurityOptions
}

export type Date = {
    year: number;
    month: number;
    day: number;
}

export type ThirdPartyAccount = {
    github: boolean;
    google: boolean;
}

export type Contact = {
    id: string;
    value: string;
    type: number;
    phone_region?: string;
}
type SecurityOptions = {
    contacts: Contact[];
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
    locale: string;
    language: string;
}
