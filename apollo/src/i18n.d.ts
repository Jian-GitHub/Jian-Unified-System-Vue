// src/i18n.d.ts
import { DefineLocaleMessage } from 'vue-i18n'

// 定义你的语言包类型
declare module 'vue-i18n' {
    export interface DefineLocaleMessage {
        // userContainer 部分
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

        // leftSide 部分
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
        cloudflareChecker: {
            status: {
                success: string
                failed: string
            }
            privacy: string
            terms: string
        }

        // Privacy Policy / Terms of Service (public pages)
        policy: {
            brand: {
                label: string
            }
            meta: {
                effective: string
                version: string
            }
            tocTitle: string
            footer: {
                contact: string
            }
            footerNote: string
            seeAlsoTerms: string
            seeAlsoPrivacy: string
            personalProject: {
                title: string
                body: string
            }
            privacy: {
                eyebrow: string
                title: string
                effectiveDate: string
                version: string
                backToLogin: string
                contactLead: string
                footerNote: string
                dataRetention: {
                    caveat: string
                }
                sections: Array<{
                    id: string
                    heading: string
                    body?: string
                    subheading?: string
                    list?: string[]
                    orderedList?: string[]
                    callout?: string
                    link?: {
                        label: string
                        href: string
                    }
                }>
            }
            terms: {
                eyebrow: string
                title: string
                effectiveDate: string
                version: string
                backToPrivacy: string
                contactLead: string
                footerNote: string
                sections: Array<{
                    id: string
                    heading: string
                    body?: string
                    subheading?: string
                    list?: string[]
                    orderedList?: string[]
                    callout?: string
                    link?: {
                        label: string
                        href: string
                    }
                }>
            }
        }
    }
}
