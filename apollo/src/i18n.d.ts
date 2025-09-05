// src/i18n.d.ts
import { DefineLocaleMessage } from 'vue-i18n'

// 定义你的语言包类型
declare module 'vue-i18n' {
    export interface DefineLocaleMessage {
        // container 部分
        container: {
            login: {
                CONTAINER_TITLE: string
                CONTAINER_TEXT: string
                TO_REGISTER: string
                FORGET_PASSWORD: string
                LOGIN_BUTTON: string
            }
            registration: {
                CONTAINER_TITLE: string
                CONTAINER_TEXT: string
                REGISTER_BUTTON: string
            }
            THIRD_PARTY: {
                THIRD_PARTY_CONTINUE: string
                PASSKEYS: string
                GOOGLE: string
                GITHUB: string
            }
        }

        // side 部分
        side: {
            SIDE_TITLE: string
            login: {
                SIDE_TEXT_1: string
                SIDE_TEXT_2: string
                TO_REGISTER: string
            }
            registration: {
                SIDE_TEXT_1: string
                SIDE_TEXT_2: string
                TO_LOGIN: string
            }
        }
    }
}
