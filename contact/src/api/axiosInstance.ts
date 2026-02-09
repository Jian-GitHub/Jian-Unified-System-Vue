import axios, {AxiosError, AxiosRequestConfig} from "axios"

// 创建 axios 实例
const axiosInstance = axios.create({
    timeout: 10000, // 设置请求超时时间
});

// 请求拦截器，用于在请求发送前添加 token 到请求 header 中
axiosInstance.interceptors.request.use(
    (config) => {
        // 获取 localStorage 中的 token
        const token = localStorage.getItem('token');

        // 如果 token 存在，则将其添加到请求 header 的 Authorization 字段中
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error: AxiosError) => {
        // 如果发生错误，则在此处处理错误
        return Promise.reject(error);
    }
);

export default axiosInstance;
