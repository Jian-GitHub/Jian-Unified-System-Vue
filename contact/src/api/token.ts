import store from "../store/index"
import axiosInstance from "./axiosInstance";
import qs from "qs";

export namespace Token {
    /**
     * 通过授权码向后端索取Token
     * @param authorizationCode 授权码
     */
    export function getByCode(authorizationCode: string) {
        return axiosInstance.post(
            store.urls.token.getByCode,
            qs.stringify({
                authorizationCode: authorizationCode,
            })
        )
    }

    /**
     * 手动验证Token
     */
    export function verify(token: string) {
        return axiosInstance.post(
            store.urls.token.verify,
            qs.stringify({
                token: token,
            })
        )
    }

    /**
     * 自动验证Token, Token 将在 axiosInstance 中被自动从 localStorage 获取并添加到header
     */
    export function autoVerify() {
        return axiosInstance.post(
            store.urls.token.verify,
            // qs.stringify({
            //     token: token,
            // })
        )
    }
}
