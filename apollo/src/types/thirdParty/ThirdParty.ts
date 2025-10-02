import {Component, ComputedRef} from "vue";

export type ThirdPartyProviderLabel = 'passkeys' | 'github' | 'google'
export type ThirdPartyProvider = {
    id?: number,
    label: ThirdPartyProviderLabel,
    icon: Component
    boundText?: ComputedRef<string>
    notBoundText?: ComputedRef<string>
    buttonText?: string
    content?: string
    isBound?: boolean
}