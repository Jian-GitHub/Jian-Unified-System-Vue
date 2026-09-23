import {createRouter, createWebHistory, RouteRecordRaw} from 'vue-router';
import {useLocalStore, useSessionStore} from "@/store";
// import App from "@/App.vue";
import Login from "@/components/login/LoginPage.vue";
import UserPage from "@/components/user/security/UserPage.vue"
import {rememberAuthorization, pendingAuthorization} from '@/utils/sso';
import {GetUserInfo, VerifyToken} from "@/api/AccountActions";

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
        component: UserPage
    },
    { path: '/authorize', name: 'Authorize', component: () => import('@/components/authorization/AuthorizationPage.vue') },
    { path: '/privacy', name: 'Privacy', component: () => import('@/components/policy/PolicyPage.vue') },
    { path: '/terms', name: 'Terms', component: () => import('@/components/policy/PolicyPage.vue') },
    // default
    {
        path: '/:pathMatch(.*)*',
        redirect: '/'
    }
];

// Routes that bypass the auth guard. Privacy & Terms are public documents
// (required by Google Sign-In and by general transparency), so they must be
// reachable while signed-out as well as signed-in.
const PUBLIC_ROUTES = new Set<string>(['Privacy', 'Terms']);

const router = createRouter({
    history: createWebHistory(), // 使用 HTML5 History 模式
    routes
});

// 全局前置守卫
router.beforeEach(async (to, from, next) => {
    const sessionStore = useSessionStore();
    const localStore = useLocalStore();
    // Public pages (Privacy / Terms) skip auth entirely so that signed-out
    // users can read them, e.g. before deciding to register.
    if (to.name && PUBLIC_ROUTES.has(String(to.name))) return next();
    if (to.name === 'Authorize') rememberAuthorization(to.fullPath);
    if (to.name === 'User' && localStore.token) {
        const pending = pendingAuthorization();
        if (pending) return next(pending);
    }
    if (!localStore.token && to.name !== 'Login') return next({name: 'Login'});

    if (localStore.token && to.name === 'Login') {
        return next(pendingAuthorization() || {name: 'User'});
    }

    if (to.name === 'User' || to.name === 'Authorize') {
        if (!await VerifyToken()) {
            localStore.token = '';
            sessionStore.language = '';
            sessionStore.resetUser();
            return next({name: 'Login'});
        }
    }

    next();
});


export default router;