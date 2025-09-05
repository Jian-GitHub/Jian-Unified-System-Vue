interface ImportMeta {
    readonly glob: (
        pattern: string,
        options?: { eager?: boolean }
    ) => Record<string, any>
}
interface ImportMetaEnv {
    readonly VITE_APP_TITLE: string
    readonly VITE_API_BASE_URL: string
    // 更多环境变量...
}