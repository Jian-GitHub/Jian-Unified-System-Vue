import {ref, Ref} from "vue";

const languages: Ref<string[], string[]> = ref(['zh', 'ja', 'en']);

const isLogin: Ref<boolean, boolean> = ref(true);

export function store() {
    return {isLogin, languages}
}