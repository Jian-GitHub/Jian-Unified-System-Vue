import {createRouter, createWebHistory, RouteRecordRaw} from 'vue-router';
// import App from "@/App.vue";
import Login from "@/components/login/LoginPage.vue";
import User from "@/components/user/security/SecurityPage.vue"

// 定义路由记录类型
const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'Home',
        // component: App,
        redirect: '/login'
    },
    {
        path: '/login',
        name: 'Login',
        component: Login
    },
    {
        path: '/user',
        name: 'User',
        component: User
    },
    // default
    {
        path: '/:pathMatch(.*)*',
        redirect: '/'
    }
];

const router = createRouter({
    history: createWebHistory(), // 使用 HTML5 History 模式
    routes
});

export default router;