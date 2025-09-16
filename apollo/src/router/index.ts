import {createRouter, createWebHistory, RouteRecordRaw} from 'vue-router';
import {useGlobalStore} from "@/store";
// import App from "@/App.vue";
import Login from "@/components/login/LoginPage.vue";
import UserPage from "@/components/user/security/UserPage.vue"
import {VerifyToken} from "@/api/AccountActions";

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

// 全局前置守卫
router.beforeEach(async (to, from, next) => {
    console.log(`准备进入: ${to.fullPath}`);
    const store = useGlobalStore();

    // 假设需要检查登录
    // const isLoggedIn = localStorage.getItem("token");
    //
    // if (to.name !== 'Login' && !isLoggedIn) {
    //     // 没有登录就跳转到 login
    //     return next({ name: 'Login' });
    // }
    if (to.name === 'Login') {
        console.log("进入Login前")
        if (store.token) {
            console.log("存在token")
            if (await VerifyToken()) {
                return next({ name: 'User' });
            }
        }
    }


    // 如果要在进入某个页面前获取数据
    if (to.name === 'User') {
        console.log("进入user")
        // try {
        //     // 例如发请求获取用户数据
        //     await fetch("/api/user/profile");
        //     console.log("用户数据已获取");
        // } catch (err) {
        //     console.error("获取用户数据失败", err);
        //     return next({ name: 'Login' });
        // }
    }

    // 放行
    next();
});


export default router;