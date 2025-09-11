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
    thirdPartyAccounts: ThirdPartyAccount
}

export type User = {
    id: string;
    displayName: string;
    email: string;
    security: SecurityOptions
}