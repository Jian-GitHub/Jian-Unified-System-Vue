import {createRouter, createWebHistory, useRouter} from "vue-router";
import {Token} from "../api/token.ts";

// 1. 定义路由组件.
// 也可以从其他文件导入
const Contact = () => import('../App.vue')

import store from "../store/index"
// const loginPageURL = 'http://localhost:9090/';

// 2. 定义一些路由
// 每个路由都需要映射到一个组件。
// 我们后面再讨论嵌套路由。
const routes = [
    {
        path: '/',
        // redirect: '/jus',
        component: Contact,
    },
    // {
    //     path: '/jus',
    //     component: Contact,
    // },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/'
        // component: Home//NotFound
    }
]

// 3. 创建路由实例并传递 `routes` 配置
// 你可以在这里输入更多的配置，但我们在这里
// 暂时保持简单
const router = createRouter({
    // 4. 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
    history: createWebHistory(),
    routes, // `routes: routes` 的缩写
})

// router.beforeEach(async (to, from, next) => {
//     // alert("to.path.toLowerCase() : " + to.path.toLowerCase())
//     // alert("to.path.authorizationCode() : " + to.query.authorizationCode)
//     if (to.path.toLowerCase() === '/') {
//
//         alert("进入路由")
//
//         let hasAuthorizationCode = false;
//         let hasToken = false;
//         let authorizationCode = '';
//         // 如果当前路由有参数，则重定向到相同路径但不包含参数的页面
//
//         // alert("to.params: " + typeof Object.keys(to.query).length + " - "+  Object.keys(to.query).length)
//
//         if (Object.keys(to.query).length > 0) {
//             alert("路由中 有参数")
//             authorizationCode = to.query.authorizationCode ? to.query.authorizationCode.toString() : null;
//             if (authorizationCode != null && authorizationCode !== '') {
//                 localStorage.setItem('authorizationCode', authorizationCode);
//                 alert("路由中 存储授权码")
//             }
//             alert("路由中 跳转 无参数路径")
//             location.href = location.origin + to.path; // 将用户重定向到相同的路由路径，但不包含参数
//         }
//
//         // authorizationCode = to.query.authorizationCode ? to.query.authorizationCode.toString() : null;
//         if (authorizationCode == null || authorizationCode === '') {
//             alert('路由中 尝试从local获取授权码')
//             authorizationCode = localStorage.getItem('authorizationCode');
//         }
//         let token = '';
//
//         // alert("authorizationCode : + " +   typeof authorizationCode)
//         // const router = useRouter();
//         // authorizationCode = router.currentRoute.value.query.authorizationCode;
//         // alert("authorizationCode : " + authorizationCode)
//
//
//         if (authorizationCode != null && authorizationCode !== '') {
//             alert('路由中 存在授权码, 存储授权码')
//             localStorage.setItem('authorizationCode', authorizationCode);
//             console.log('authorizationCode', authorizationCode);
//             hasAuthorizationCode = true;
//         } else {
//             console.log('authorizationCode is null');
//             hasAuthorizationCode = false;
//         }
//
//         token = localStorage.getItem('token')
//         // alert("token : " + token)
//         if (token) {
//             hasToken = true;
//         } else {
//             hasToken = false;
//         }
//
//         // 获取协议、主机和端口部分的 URL
//         const origin = window.location.origin;
//         // 获取路径部分的 URL
//         const pathname = to.path;
//         // 拼接协议、主机和端口部分以及路径部分，得到完整的 URL（不带参数）
//         const urlWithoutParams = origin + pathname;
//         // console.log(urlWithoutParams);
//         // return urlWithoutParams;
//
//
//         alert("路由中 授权码 hasAuthorizationCode: " + hasAuthorizationCode)
//         if (hasAuthorizationCode) {
//             alert("有授权码, 去验证 - " + authorizationCode)
//             await Token.getByCode(authorizationCode)
//                 .then(response => {
//                     alert("路由验证授权码后 得到响应状态 : " + response.status)
//                     alert("路由验证授权码后 得到响应数据 : " + response.data)
//                     console.log(response.data)
//                     if (response.status !== 200) {
//                         alert("验证授权码失败")
//                         // 验证失败, 重定向到登录页
//                         location.href = store.loginPageURL + '?from=' + urlWithoutParams;
//                     } else {
//                         alert("路由中授权码 验证成功 得到 token : " + response.data)
//                         localStorage.setItem('token', response.data)
//                         next()
//                     }
//                 })
//                 .catch(e => {
//                     console.error(e)
//                     alert("出现错误: " + e)
//                     location.href = store.loginPageURL + '?from=' + urlWithoutParams;
//                 })
//             alert("执行完成")
//         } else {
//             alert('路由中 进入无授权码')
//             if (hasToken) {
//                 // 无授权码
//                 // 有Token
//                 alert("路由中 无授权码 有Token")
//                 await Token.verify(token)
//                     .then(response => {
//                         // alert('状态为!response.status: ' + response.status)
//                         if (response.status !== 200) {
//                             alert("路由中 无授权码 Token 验证失败")
//                             location.href = store.loginPageURL + '?from=' + urlWithoutParams;
//                         } else {
//                             alert("当前已登录")
//                             next();
//                         }
//                     })
//                     .catch(e => {
//                         console.error(e)
//                         // alert(e)
//                     })
//             } else {
//                 alert('路由中 无授权码 且 无Token')
//                 // 无授权码 且 无Token
//                 // 重定向到登录页
//                 location.href = store.loginPageURL + '?from=' + urlWithoutParams;
//             }
//         }
//         // alert("进入前")
//         // alert("authorizationCode : " + authorizationCode)
//         // alert("token : " + token)
//
//
//         // next()
//     }
// })

export default router
