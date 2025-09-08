const toggle = () => {
    const willChangeMode = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", willChangeMode);
    localStorage.setItem('theme', willChangeMode)
};

const clouds = ["daytime-cloud", "daytime-cloud-light"]
const stars  = ["big","big","medium","medium","small","small"]

export function logic() {
    return {toggle, clouds, stars}
}