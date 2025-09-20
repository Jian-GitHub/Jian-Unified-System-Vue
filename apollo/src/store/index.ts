import {computed, ComputedRef, ref, Ref} from "vue";
import {User} from "@/types/User";
import {defineStore} from 'pinia';
import ApolloLogoBlue from "@/components/user/basic/ApolloLogoBlue.vue";
import PasswordIcon from "@/assets/icon/password_input_20x20.svg";
import SecurityIcon from "@/assets/icon/token_20x20.svg";
import EmailIcon from "@/assets/icon/email_20x20.svg";
import PasskeysIcon from "@/assets/logo/passkeys_outline_20x20.svg";
import ThirdPartyIcon from "@/assets/logo/github_20x20.svg";
import DeleteAccountIcon from "@/assets/icon/delete_account.svg";

import UserIcon from "@/assets/icon/user_20x20.svg";
import DateIcon from "@/assets/icon/date_20x20.svg";
import EarthIcon from "@/assets/icon/earth_20x20.svg";
import LanguageIcon from "@/assets/icon/language_20x20.svg";

import {useI18n} from "vue-i18n";
import {ActionsIds, UserAction} from "@/types/dialog/UserAction";
import {AccountInfoShort, UserPageContent} from "@/types/UserPage";


// Theme mode type
export type Theme = 'light' | 'dark';

export const useSessionStore = defineStore('session', () => {

    const languages: Ref<string[], string[]> = ref(['zh', 'ja', 'ko', 'en']);

    const actionsIdsObject = ref({
        infoAction: {
            name: 100,
            birthday: 101,
            locale: 102,
            language: 103
        },
        securityAction: {
            contacts: 200,
            password: 201,
            security: 202,
            notification: 203,
            passkeys: 204,
            thirdPartyAccounts: 205,
            removeAccount: 206
        }
    })
    const actionsIds: Ref<ActionsIds> = ref({
        infoActions: [
            actionsIdsObject.value.infoAction.name,
            actionsIdsObject.value.infoAction.birthday,
            actionsIdsObject.value.infoAction.locale,
            actionsIdsObject.value.infoAction.language,
        ],
        securityActions: [
            actionsIdsObject.value.securityAction.contacts,
            actionsIdsObject.value.securityAction.password,
            actionsIdsObject.value.securityAction.security,
            actionsIdsObject.value.securityAction.notification,
            actionsIdsObject.value.securityAction.passkeys,
            actionsIdsObject.value.securityAction.thirdPartyAccounts,
            actionsIdsObject.value.securityAction.removeAccount,
        ]
    });

    const theme: Ref<string> = ref('');

    const preferredTheme: Ref<string> = ref('');

    const language: Ref<string> = ref('');

    const resetUser = () => {
        user.value = {
            id: '',
            avatar: '',
            info: {
                name: {
                    givenName: '',
                    middleName: '',
                    familyName: '',
                },
                birthday: {
                    year: 0,
                    month: 0,
                    day: 0,
                },
                locale: '',
                language: '',
            },
            security: {
                contacts: [],
                passwordUpdatedDate: {
                    year: 0,
                    month: 0,
                    day: 0,
                },
                accountSecurityTokenNum: null,
                notificationEmail: null,
                passkeysNum: null,
                thirdPartyAccounts: {
                    github: null,
                    google: null,
                }
            }
        };
    }

    const user: Ref<User | null> = ref({
        id: '',
        avatar: '',
        info: {
            name: {
                givenName: '',
                middleName: '',
                familyName: '',
            },
            birthday: {
                year: 0,
                month: 0,
                day: 0,
            },
            locale: '',
            language: '',
        },
        security: {
            contacts: [],
            passwordUpdatedDate: {
                year: 0,
                month: 0,
                day: 0,
            },
            accountSecurityTokenNum: null,
            notificationEmail: null,
            passkeysNum: null,
            thirdPartyAccounts: {
                github: null,
                google: null,
            }
        }
    });

    // const userActionDialogVisible: Ref<boolean, boolean> = ref(false);

    const isLogin: Ref<boolean, boolean> = ref(true);
    const isContainerSwitching: Ref<boolean, boolean> = ref(false);

    // const userPageItemIndex: Ref<number> = ref(0);

    const userActionDialogVisible: Ref<boolean> = ref(false);
    const userActionDialogLoading: Ref<boolean> = ref(true);
    const userActionDialogId: Ref<number> = ref(-1);

    const {t, locale} = useI18n()

    function createAccountInfoShort(): ComputedRef<AccountInfoShort> {
        return computed(()=>{
            return {
                id: user.value.id,
                name: nameInfo.value ? nameInfo.value : t('user_container.left_side.username'),
                // email: user.scope.email
            }
        })
    }

    const accountInfoShort: ComputedRef<AccountInfoShort> = createAccountInfoShort()

    const isUserNull = computed(() => user == null || user.value.info == null)

    const nameInfo: ComputedRef<string> = computed(() => {
        if (isUserNull.value ||
            user.value.info.name == null ||
            (!user.value.info.name.givenName && !user.value.info.name.middleName && !user.value.info.name.familyName)
        ) return '';
        let userName: string;
        switch (locale.value) {
            case 'zh':
            case 'ja':
            case 'ko':
                if (user.value.info.name.middleName == null || user.value.info.name.middleName === ''){
                    userName = user.value.info.name.familyName + user.value.info.name.givenName;
                } else {
                    userName = user.value.info.name.familyName + ' ' + user.value.info.name.middleName + ' ' + user.value.info.name.givenName;
                }
                break;
            case 'en':
            default:
                if (user.value.info.name.middleName == null || user.value.info.name.middleName === ''){
                    userName = user.value.info.name.givenName + ' ' + user.value.info.name.familyName;
                } else {
                    userName = user.value.info.name.givenName + ' ' + user.value.info.name.middleName + ' ' + user.value.info.name.familyName;
                }
                break;
        }
        return userName;
    })

    const infoActionCardsStatus: Ref<Record<number, boolean>> = ref({
        100: true,
        101: true,
        102: true,
        103: true,
    })
    const securityActionCardsStatus: Ref<Record<number, boolean>> = ref({
        200: true,
        201: true,
        202: true,
        203: true,
        204: true,
        205: true,
        206: false,
    })

    function createInfoPageContent(): ComputedRef<UserPageContent> {
        const contentTitle: ComputedRef<string> = computed(() => t('info_page.title'))

        const contentDescription: ComputedRef<string> = computed(() => t('info_page.description'))

        const birthdayInfo = computed(() => {
            if (isUserNull.value ||
                !user.value.info.birthday ||
                user.value.info.birthday.month === 0
            ) return t('info_page.actions.birthday.empty');
            return t('info_page.actions.birthday.text_line1', {
                year: user.value.info.birthday.year,
                month: user.value.info.birthday.month < 10 ? '0' + user.value.info.birthday.month.toString() : user.value.info.birthday.month.toString(),
                day: user.value.info.birthday.day < 10 ? '0' + user.value.info.birthday.day.toString() : user.value.info.birthday.day.toString(),
            })
        })

        const countryRegionInfo = computed(() => {
            if (isUserNull.value || !user.value.info.locale) return t('info_page.actions.country_region.empty');
            return t('country_region.' + user.value.info.locale)
        })

        const languageInfo = computed(() => {
            if (isUserNull.value || !user.value.info.language) return t('info_page.actions.language.empty');
            return t('info_page.actions.language.text_line1',
                {
                    language_original: t('languages.' + user.value.info.language + '.original'),
                    language_text: t('languages.' + user.value.info.language + '.text')
                });
        })

        const infoActions: ComputedRef<UserAction[]> = computed(() => [
            {
                id: actionsIdsObject.value.infoAction.name,
                isFetching: infoActionCardsStatus.value[actionsIdsObject.value.infoAction.name],
                title: t('info_page.actions.name.title'),
                icon: UserIcon,
                text_line1: nameInfo.value ? nameInfo.value : t('info_page.actions.name.empty'),
            },
            {
                id: actionsIdsObject.value.infoAction.birthday,
                isFetching: infoActionCardsStatus.value[actionsIdsObject.value.infoAction.birthday],
                title: t('info_page.actions.birthday.title'),
                icon: DateIcon,
                text_line1: birthdayInfo.value
            },
            {
                id: actionsIdsObject.value.infoAction.locale,
                isFetching: infoActionCardsStatus.value[actionsIdsObject.value.infoAction.locale],
                title: t('info_page.actions.country_region.title'),
                icon: EarthIcon,
                text_line1: countryRegionInfo.value
            },
            {
                id: actionsIdsObject.value.infoAction.language,
                isFetching: infoActionCardsStatus.value[actionsIdsObject.value.infoAction.language],
                title: t('info_page.actions.language.title'),
                icon: LanguageIcon,
                text_line1: languageInfo.value,
            }
        ])

        return computed(() => {
            return {
                title: contentTitle.value,
                description: contentDescription.value,
                actions: infoActions.value
            }
        })
    }

    function setActionCardStatus(type: 0 | 1, id: number, status: boolean) {
        switch (type) {
            case 0:
                infoActionCardsStatus.value[id] = status;
                break;
            case 1:
                securityActionCardsStatus.value[id] = status;
                break;
            default:
                break;
        }
    }

    function createSecurityPageContent(): ComputedRef<UserPageContent> {
        const contentTitle: ComputedRef<string> = computed(() => t('security_page.title'))

        const contentDescription: ComputedRef<string> = computed(() => t('security_page.description'))

        const contactsInfo = computed(() => {
            if (isUserNull.value || user.value.security.contacts.length === 0) return {line1: t('security_page.actions.email_mobile.empty'), line2: '', line3: ''};
            const contactsNum = user.value.security.contacts.length;
            switch (contactsNum) {
                case 0:
                    return {line1: '', line2: '', line3: ''};
                case 1:
                    return {
                        line1: user.value.security.contacts[0].value,
                        line2: '',
                        line3: ''
                    };
                case 2:
                    return {
                        line1: user.value.security.contacts[0].value,
                        line2: user.value.security.contacts[1].value,
                        line3: ''
                    };
                default:
                    return {
                        line1: user.value.security.contacts[0].value,
                        line2: user.value.security.contacts[1].value,
                        line3: t('security_page.actions.email_mobile.text_line3', {num: (contactsNum - 2)})
                    };
            }
        })

        const passwordUpdatedInfo = computed(() => {
            if (isUserNull.value || user.value.security.passwordUpdatedDate.month === 0) return  t('security_page.actions.password.empty');
            return t('security_page.actions.password.text_line1', {
                year: user.value.security.passwordUpdatedDate.year,
                month: user.value.security.passwordUpdatedDate.month < 10 ? '0' + user.value.security.passwordUpdatedDate.month.toString() : user.value.security.passwordUpdatedDate.month.toString(),
                day: user.value.security.passwordUpdatedDate.day < 10 ? '0' + user.value.security.passwordUpdatedDate.day.toString() : user.value.security.passwordUpdatedDate.day.toString(),
            })
        })

        const tokenInfo = computed(() => {
            if (isUserNull.value) return t('security_page.actions.security.text_line2', {num: 0});
            return t('security_page.actions.security.text_line2', {num: user.value.security.accountSecurityTokenNum});
        })

        const notificationEmail = computed(() => {
            if (isUserNull.value || !user.value.security.notificationEmail) return '';
            return user.value.security.notificationEmail;
        })

        const passkeysInfo = computed(() => {
            if (isUserNull.value) return t('security_page.actions.passkeys.text_line1', {num: 0});
            return t('security_page.actions.passkeys.text_line1', {num: user.value.security.passkeysNum});
        })

        const thirdPartyAccountsInfo = computed(() => {
            if (isUserNull.value) return {line1: '', line2: ''};
            const boundText = t('security_page.actions.third_party_account.bound');
            const notBoundText = t('security_page.actions.third_party_account.not_bound');
            let line1Text = 'GitHub: '
            if (user.value.security.thirdPartyAccounts.github)
                line1Text += user.value.security.thirdPartyAccounts.github ? boundText : notBoundText;
            else
                line1Text += notBoundText;

            let line2Text = 'Google: '
            if (user.value.security.thirdPartyAccounts.google)
                line2Text += user.value.security.thirdPartyAccounts.google ? boundText : notBoundText;
            else
                line2Text += notBoundText;
            return {line1: line1Text, line2: line2Text};
        })

        const securityActions: ComputedRef<UserAction[]> = computed(() => [
            {
                id: actionsIdsObject.value.securityAction.contacts,
                isFetching: securityActionCardsStatus.value[actionsIdsObject.value.securityAction.contacts],
                title: t('security_page.actions.email_mobile.title'),
                icon: ApolloLogoBlue,
                text_line1: contactsInfo.value.line1,
                text_line2: contactsInfo.value.line2,
                text_line3: contactsInfo.value.line3
            },
            {
                id: actionsIdsObject.value.securityAction.password,
                isFetching: securityActionCardsStatus.value[actionsIdsObject.value.securityAction.password],
                title: t('security_page.actions.password.title'),
                icon: PasswordIcon,
                text_line1: passwordUpdatedInfo.value
            },
            {
                id: actionsIdsObject.value.securityAction.security,
                isFetching: securityActionCardsStatus.value[actionsIdsObject.value.securityAction.security],
                title: t('security_page.actions.security.title'),
                icon: SecurityIcon,
                text_line1: t('security_page.actions.security.text_line1'),
                text_line2: tokenInfo.value
            },
            {
                id: actionsIdsObject.value.securityAction.notification,
                isFetching: securityActionCardsStatus.value[actionsIdsObject.value.securityAction.notification],
                title: t('security_page.actions.notification_email.title'),
                icon: EmailIcon,
                text_line1: notificationEmail.value,
            },
            {
                id: actionsIdsObject.value.securityAction.passkeys,
                isFetching: securityActionCardsStatus.value[actionsIdsObject.value.securityAction.passkeys],
                title: t('security_page.actions.passkeys.title'),
                icon: PasskeysIcon,
                text_line1: passkeysInfo.value
            },
            {
                id: actionsIdsObject.value.securityAction.thirdPartyAccounts,
                isFetching: securityActionCardsStatus.value[actionsIdsObject.value.securityAction.thirdPartyAccounts],
                title: t('security_page.actions.third_party_account.title'),
                icon: ThirdPartyIcon,
                text_line1: thirdPartyAccountsInfo.value.line1,
                text_line2: thirdPartyAccountsInfo.value.line2
            },
            {
                id: actionsIdsObject.value.securityAction.removeAccount,
                isFetching: securityActionCardsStatus.value[actionsIdsObject.value.securityAction.removeAccount],
                isDanger: true,
                title: t('security_page.actions.delete_account.title'),
                icon: DeleteAccountIcon,
                text_line1: t('security_page.actions.delete_account.text_line1')
            },
        ])

        return computed(() => {
            return {
                title: contentTitle.value,
                description: contentDescription.value,
                actions: securityActions.value
            }
        })
    }

    const infoPageContent: ComputedRef<UserPageContent> = createInfoPageContent()
    const securityPageContent: ComputedRef<UserPageContent> = createSecurityPageContent()

    const clear = ()=> {
        theme.value = '';
        language.value = '';
        user.value = {} as User;
        sessionStorage.removeItem('store')
    }
    return {
        clear,
        setActionCardStatus,
        resetUser,
        user,
        theme,
        preferredTheme,
        language,
        isLogin,
        languages, /*userPageItemIndex,*/
        securityPageContent,
        userActionDialogVisible,
        infoPageContent,
        accountInfoShort,
        actionsIds,
        actionsIdsObject,
        userActionDialogLoading,
        userActionDialogId
    }
}, {
    persist: {
        storage: sessionStorage,
        pick: ['preferredTheme', 'user', 'accountInfoShort', /*'theme',*/ 'language', 'isLogin'/*, 'languages', 'actionsIds'*/],
        serializer: {
            serialize: (value) => {
                try {
                    return JSON.stringify(value)
                } catch (e) {
                    console.error(e)
                    return '{}'
                }
            },
            deserialize: (value) => {
                try {
                    return JSON.parse(value)
                } catch (e) {
                    console.error(e)
                    return null
                }
            }
        }
    }
})

export const useLocalStore = defineStore('local', () => {

    const token: Ref<string> = ref('');

    const clear = ()=> {
        token.value = '';
        localStorage.removeItem('store')
    }
    return {
        clear,
        token,
    }
}, {
    persist: {
        storage: localStorage,
        pick: ['token',],
        serializer: {
            serialize: (value) => {
                try {
                    return JSON.stringify(value)
                } catch (e) {
                    console.error(e)
                    return '{}'
                }
            },
            deserialize: (value) => {
                try {
                    return JSON.parse(value)
                } catch (e) {
                    console.error(e)
                    return null
                }
            }
        }
    }
})


