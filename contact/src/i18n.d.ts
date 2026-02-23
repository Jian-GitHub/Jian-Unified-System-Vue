// src/i18n.d.ts
import { DefineLocaleMessage } from 'vue-i18n'

// 定义你的语言包类型
declare module 'vue-i18n' {
    export interface DefineLocaleMessage {
        // info 部分
        info: {
            name_zh: string,
            name: string,
            reversed_name: boolean,
            msg: string,
            description: string,
            email: string
        }

        // contact 部分
        contact: {
            qq: string,
            wechat: string,
            instagram: string,
            line: string,
            whatsapp: string
        }
    }
}
