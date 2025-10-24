import axiosInstance from "@/api/axiosInstance";
import {AxiosResponse} from "axios";
import {Server} from "@/config"

export type LoginFormData = {
    email: string;
    password: string;
    cloudflareToken: string;
}
export type LoginResponseData = {
    code: number;
    message: string;
    data: {
        token: string;
        id: string;
        name: {
            givenName: string;
            middleName: string;
            familyName: string;
        };
        avatar: string;
        locale: string;
        language: string;
        birthday: {
            year: number;
            month: number;
            day: number;
        }
    }
}

// Login
export async function Login(data: LoginFormData): Promise<AxiosResponse<LoginResponseData>> {
    return axiosInstance.post(Server.service.account.login, {
        email: data.email,
        password: data.password,
        cloudflareToken: data.cloudflareToken
    })
}


export type RegisterFormData = {
    email: string;
    password: string;
    confirmedPassword: string;
    language: string,
    cloudflareToken: string;
}

export type RegisterResponseData = {
    code: number;
    message: string;
    data: {
        token: string;
    }
}
// Register
export function Register(data: RegisterFormData): Promise<AxiosResponse<RegisterResponseData>> {
    return axiosInstance.post(Server.service.account.register, {
        email: data.email,
        password: data.password,
        confirm_password: data.password,
        language: data.language,
        cloudflareToken: data.cloudflareToken
    })
}

// VerifyToken
export async function VerifyToken(): Promise<boolean> {
    try {
        const response = await axiosInstance.post(Server.service.account.verifyToken)
        if (response.status === 200) {
            if (response.data.code === 200) {
                return response.data.data.ok
            }
        }
        return false;
    } catch (error) {
        return false;
    }
}

// GetUserInfoShort
// export async function GetUserInfoShort(): Promise<boolean> {
//     const response = await axiosInstance.post(Server.service.account.verifyToken)
//     if (response.status === 200) {
//         if (response.data.code === 200) {
//             return response.data.data.ok
//         }
//     }
// }

export type UserInfoResponseData = {
    code: number;
    message: string;
    data: {
        id: string,
        given_name: string;
        middle_name: string;
        family_name: string;
        avatar: string;
        birthday_year: 0,
        birthday_month: 0,
        birthday_day: 0,
        notification_email: string;
        locate: string;
        language: string;
        create_time: string;
        last_login_time: string;
    }
}
// GetUserInfo
export async function GetUserInfo(): Promise<AxiosResponse<UserInfoResponseData>> {
    return axiosInstance.post(Server.service.account.getUserInfo)
}

import {Date, Contact, ThirdPartyAccount} from "@/types/User";

export type UserSecurityInfoResponseData = {
    code: number;
    message: string;
    data: {
        contacts: Contact[];

        passwordUpdatedDate: Date;
        accountSecurityTokenNum: number;
        passkeysNum: number;
        thirdPartyAccounts: ThirdPartyAccount;
    }
}
// GetUserSecurityInfo
export async function GetUserSecurityInfo(): Promise<AxiosResponse<UserSecurityInfoResponseData>> {
    return axiosInstance.post(Server.service.account.getUserSecurity)
}

export type SubsystemToken = {
    id: string;
    value: string;
    name: string;
    date: Date;
}
export type GetSubsystemTokensResponseData = {
    code: number;
    message: string;
    data: {
        tokens: SubsystemToken[];
    }
}
// Get 10 Subsystem Tokens
export async function GetTenSubsystemTokens(page: number): Promise<AxiosResponse<GetSubsystemTokensResponseData>> {
    if (page < 1) throw new Error('page must >= 1');
    return axiosInstance.post(Server.service.account.security.subsystemToken.getTenSubsystemToken, {
        page: page,
    })
}

export type GenerateSubsystemTokenResponseData = {
    code: number;
    message: string;
    data: {
        token: SubsystemToken;
    }
}
// Generate Subsystem Token
export async function GenerateSubsystemToken(name: string, scope: number[]): Promise<AxiosResponse<GenerateSubsystemTokenResponseData>> {
    if (scope.length == 0) throw new Error('scope is empty');
    return axiosInstance.post(Server.service.account.security.subsystemToken.generateSubsystemToken, {
        name: name,
        scope: scope, //JSON.stringify(scope),
    })
}


// Passkeys
export type Passkey = {
    id: string;
    name: string;
    date: Date;
    isEnabled: boolean;
}

export type PasskeysRegisterStartResponseData = {
    code: number;
    message: string;
    data: {
        session_id: string;
        options_json: string;
    }
}
// Passkeys Register - start
export async function PasskeysRegisterStart(user_name?: string, display_name?: string): Promise<AxiosResponse<PasskeysRegisterStartResponseData>> {
    let data: {
        user_name: string
        display_name: string
    } = {
        user_name: '',
        display_name: ''
    }
    if (user_name && display_name) {
        data.user_name = user_name;
        data.display_name = display_name;
    }
    return axiosInstance.post(Server.service.account.passkeys.register.start, data);
}

export type PasskeysRegisterFinishOptions = {
    id: string
    type: string
    rawId: string
    response: {
        clientDataJSON: string
        attestationObject: string
    }
}

export type PasskeysRegisterFinishResponseData = {
    code: number;
    message: string;
    data: {
        token: string;
    }
}
// Passkeys Register - finish
export async function PasskeysRegisterFinish(currentSession: string, language: string, finishOptions: PasskeysRegisterFinishOptions): Promise<AxiosResponse<PasskeysRegisterFinishResponseData>> {
    return axiosInstance.post(Server.service.account.passkeys.register.finish, {
        session_id: currentSession,
        language: language,
        credential: JSON.stringify(finishOptions)
    });
}

export type PasskeysLoginStartResponseData = {
    code: number;
    message: string;
    data: {
        options_json: string;
        session_id:   string;
    }
}
// Passkeys Login - start
export async function PasskeysLoginStart(): Promise<AxiosResponse<PasskeysLoginStartResponseData>> {
    return axiosInstance.post(Server.service.account.passkeys.login.start);
}

export type PasskeysLoginFinishOptions = {
    id: string
    type: string
    rawId: string
    response: {
        clientDataJSON: string
        authenticatorData: string
        signature: string
        userHandle: string
    }
}

export type PasskeysLoginFinishResponseData = {
    code: number;
    message: string;
    data: {
        token: string;
    }
}
// Passkeys Login - finish
export async function PasskeysLoginFinish(session_id: string, finishLoginOptions:PasskeysLoginFinishOptions): Promise<AxiosResponse<PasskeysLoginFinishResponseData>> {
    return axiosInstance.post(Server.service.account.passkeys.login.finish, {
        session_id: session_id,
        assertion: JSON.stringify(finishLoginOptions),
    });
}

export type ThirdPartyContinueResponseData = {
    code: number;
    message: string;
    data: {
        url: string;
    }
}
// Third Party - Continue
export async function ThirdPartyContinue(provider: string): Promise<AxiosResponse<ThirdPartyContinueResponseData>> {
    return axiosInstance.post(Server.service.account.thirdParty.continue, {
        provider: provider,
    });
}
export type ThirdPartyBindResponseData = {
    code: number;
    message: string;
    data: {
        url: string;
    }
}
// Third Party - Bind
export async function ThirdPartyBind(provider: string): Promise<AxiosResponse<ThirdPartyBindResponseData>> {
    return axiosInstance.post(Server.service.account.thirdParty.bind, {
        provider: provider,
    });
}

export type ThirdPartyRemoveResponseData = {
    code: number;
    message: string;
    data: {
        ok: boolean;
    }
}

export type GetTenPasskeysResponseData = {
    code: number;
    message: string;
    data: {
        passkeys: Passkey[];
    }
}
// Get 10 Passkeys
export async function GetTenPasskeys(page: number): Promise<AxiosResponse<GetTenPasskeysResponseData>> {
    if (page < 1) throw new Error('page must >= 1');
    return axiosInstance.post(Server.service.account.security.passkeys.getTenPasskeys, {
        page: page,
    })
}

// Third Party - Remove
export async function ThirdPartyRemove(thirdPartyId: number): Promise<AxiosResponse<ThirdPartyRemoveResponseData>> {
    return axiosInstance.post(Server.service.account.thirdParty.remove, {
        thirdPartyId: thirdPartyId,
    });
}

export type ThirdPartyAccountInfo = {
    id: number;
    provider: string;
    isBound:  boolean;
    content:  string;
}
export type ThirdPartyGetInfoResponseData = {
    code: number;
    message: string;
    data: {
        accounts: ThirdPartyAccountInfo[];
    }
}
// Third Party - Remove
export async function ThirdPartyGetInfo(): Promise<AxiosResponse<ThirdPartyGetInfoResponseData>> {
    return axiosInstance.post(Server.service.account.thirdParty.getInfo);
}