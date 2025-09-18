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
export async function GetUserInfoShort(): Promise<boolean> {
    const response = await axiosInstance.post(Server.service.account.verifyToken)
    if (response.status === 200) {
        if (response.data.code === 200) {
            return response.data.data.ok
        }
    }
}

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