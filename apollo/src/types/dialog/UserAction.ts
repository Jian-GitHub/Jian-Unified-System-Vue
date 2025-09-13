import {type Component} from "vue";

export type UserActionDialogData = {
    className: {
        class: string,
        header: string,
        body: string,
        footer: string,
    },
    component: {
        header: Component | null,
        body: Component | null,
        footer: Component | null,
    }
}

export type ActionsIds = {
    infoActions: number[],
    securityActions: number[],
}

export type UserAction = {
    id: number;
    isDanger?: boolean;
    title: string;
    icon: Component;
    text_line1?: string;
    text_line2?: string;
    text_line3?: string;
}