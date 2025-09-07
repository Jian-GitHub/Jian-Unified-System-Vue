import {ref, Ref} from "vue";

const isLogin: Ref<boolean, boolean> = ref(true);
export function store() {
    return {isLogin}
}