import {useGlobalStore} from "@/store";


const clouds = ["daytime-cloud", "daytime-cloud-light"]
const stars  = ["big","big","medium","medium","small","small"]

export function logic() {
    const globalStore = useGlobalStore()
    const toggle = () => {
        const willChangeMode = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", willChangeMode);
        // localStorage.setItem('theme', willChangeMode);
        globalStore.theme = willChangeMode;
        globalStore.preferredTheme = willChangeMode;
        // console.log(globalStore.theme)
        // console.log(globalStore.preferredTheme)
    };
    return {toggle, clouds, stars}
}