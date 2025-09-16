import type {UserAction} from "@/types/dialog/UserAction"

export type UserPageContent = {
    title: string;
    description: string;
    actions: UserAction[];
}

export type AccountInfoShort = {
    id: string;
    name: string;
    // email: string;
}