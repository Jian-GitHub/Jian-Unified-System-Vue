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
    }
}

export type RegisterFormData = {
    email: string;
    password: string;
    confirmedPassword: string;
    language: string,
    cloudflareToken: string;
}

// Login
export const Login = async (data: LoginFormData): Promise<AxiosResponse<LoginResponseData>> => {
    return axiosInstance.post(Server.service.account.login, {
        email: data.email,
        password: data.password,
        cloudflareToken: data.cloudflareToken
    })
}

// Register
export const Register = (data: RegisterFormData) => {
    return axiosInstance.post(Server.service.account.register, {
        email: data.email,
        password: data.password,
        confirm_password: data.password,
        language: data.language,
        cloudflareToken: data.cloudflareToken
    })
}