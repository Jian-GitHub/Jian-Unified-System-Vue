import type {Date} from "@/types/User";
import {PasskeysDialogRowData} from "@/types/dialog/security/Passkeys";

export type AccountSecurityTokenDialogRowData = {
    name: string,
    value: string,
    date: Date
}