import {ref, Ref, type Component} from "vue";
import type {User} from "@/types/user";
import {defineStore} from 'pinia';

export type UserSecurityAction = {
    id: number;
    title: string;
    icon: Component;
    text_line1?: string;
    text_line2?: string;
    text_line3?: string;
}

// Theme mode type
export type Theme = 'light' | 'dark';

export const useGlobalStore = defineStore('store', () => {

    const languages: Ref<string[], string[]> = ref(['zh', 'ja', 'ko', 'en']);

    const theme: Ref<string, Theme> = ref('light');

    const user: Ref<User | null> = ref({} as User);

    const userPasskeysDialogVisible: Ref<boolean, boolean> = ref(false);

    const isLogin: Ref<boolean, boolean> = ref(true);

    const userPageItemIndex: Ref<number> = ref(0);

    return { user, theme, userPasskeysDialogVisible, isLogin, languages, userPageItemIndex}
}, {
    persist: {
        storage: sessionStorage,
        serializer: {
            serialize: (value) => {
                try {
                    return JSON.stringify(value)
                } catch (e) {
                    console.error('序列化错误', e)
                    return '{}'
                }
            },
            deserialize: (value) => {
                try {
                    return JSON.parse(value)
                } catch (e) {
                    console.error('反序列化错误', e)
                    return null
                }
            }
        }
    }
})