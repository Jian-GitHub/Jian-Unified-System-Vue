import {type Component} from "vue";

export type AccountInfoShort = {
    id: string;
    name: string;
    email: string;
}

export type PasskeysDialogRowData = {
    displayName: string,
    date: Date
}

export type ActionsIds = {
    infoActions: number[],
    securityActions: number[],
}
export type UserAction = {
    id: number;
    isDanger?: boolean;
    title: string;
    icon: Component;
    text_line1?: string;
    text_line2?: string;
    text_line3?: string;
}

export type UserPageContent = {
    title: string;
    description: string;
    actions: UserAction[];
}

type Date = {
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

export type User = {
    id: string;
    // displayName: string;
    email: string;
    info: InfoOptions;
    security: SecurityOptions
}