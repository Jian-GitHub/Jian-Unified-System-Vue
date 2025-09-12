import {computed, ComputedRef, ref, Ref} from "vue";
import {User, UserAction, UserPageContent, AccountInfoShort, ActionsIds} from "@/types/user";
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


// Theme mode type
export type Theme = 'light' | 'dark';

export const useGlobalStore = defineStore('store', () => {

    const languages: Ref<string[], string[]> = ref(['zh', 'ja', 'ko', 'en']);

    const actionsIds: Ref<ActionsIds> = ref({
        infoActions: [
            100,
            101,
            102,
            103
        ],
        securityActions: [
            200,
            201,
            202,
            203,
            204,
            205,
            206,
        ]
    });

    const theme: Ref<string, Theme> = ref('light');

    const user: Ref<User | null> = ref({} as User);

    // const userPasskeysDialogVisible: Ref<boolean, boolean> = ref(false);

    const isLogin: Ref<boolean, boolean> = ref(true);

    // const userPageItemIndex: Ref<number> = ref(0);

    const userPasskeysDialogVisible: Ref<boolean> = ref(false);

    const {t, locale} = useI18n()

    function createAccountInfoShort(): ComputedRef<AccountInfoShort> {
        return computed(()=>{
            return {
                id: user.value.id,
                name: nameInfo.value,
                email: user.value.email
            }
        })
    }

    const accountInfoShort: ComputedRef<AccountInfoShort> = createAccountInfoShort()

    const isUserNull = computed(() => user == null || user.value.info == null)

    const nameInfo: ComputedRef<string> = computed(() => {
        if (isUserNull.value || user.value.info.name == null) return '';
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

    function createInfoPageContent(): ComputedRef<UserPageContent> {
        const contentTitle: ComputedRef<string> = computed(() => t('info_page.title'))

        const contentDescription: ComputedRef<string> = computed(() => t('info_page.description'))

        const birthdayInfo = computed(() => {
            if (isUserNull.value || !user.value.info.birthday) return '';
            return t('info_page.actions.birthday.text_line1', {
                year: user.value.info.birthday.year,
                month: user.value.info.birthday.month,
                day: user.value.info.birthday.day
            })
        })

        const countryRegionInfo = computed(() => {
            if (isUserNull.value || !user.value.info.countryRegion) return '';
            return t('country_region.' + user.value.info.countryRegion)
        })

        const languageInfo = computed(() => {
            if (isUserNull.value || !user.value.info.language) return '';
            return t('info_page.actions.language.text_line1',
                {
                    language_original: t('languages.' + user.value.info.language + '.original'),
                    language_text: t('languages.' + user.value.info.language + '.text')
                });
        })

        const infoActions: ComputedRef<UserAction[]> = computed(() => [
            {
                id: actionsIds.value.infoActions[0],
                title: t('info_page.actions.name.title'),
                icon: UserIcon,
                text_line1: nameInfo.value,
            },
            {
                id:actionsIds.value.infoActions[1],
                title: t('info_page.actions.birthday.title'),
                icon: DateIcon,
                text_line1: birthdayInfo.value
            },
            {
                id: actionsIds.value.infoActions[2],
                title: t('info_page.actions.country_region.title'),
                icon: EarthIcon,
                text_line1: countryRegionInfo.value
            },
            {
                id: actionsIds.value.infoActions[3],
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

    function createSecurityPageContent(): ComputedRef<UserPageContent> {
        const contentTitle: ComputedRef<string> = computed(() => t('security_page.title'))

        const contentDescription: ComputedRef<string> = computed(() => t('security_page.description'))

        const contactsInfo = computed(() => {
            if (isUserNull.value || user.value.security.contacts == null) return {line1: '', line2: '', line3: ''};
            const contactsNum = user.value.security.contacts.length;
            switch (contactsNum) {
                case 0:
                    return {line1: '', line2: '', line3: ''};
                case 1:
                    return {line1: user.value.security.contacts[0], line2: '', line3: ''};
                case 2:
                    return {
                        line1: user.value.security.contacts[0],
                        line2: user.value.security.contacts[1],
                        line3: ''
                    };
                default:
                    return {
                        line1: user.value.security.contacts[0],
                        line2: user.value.security.contacts[1],
                        line3: t('security_page.actions.email_mobile.text_line3', {num: (contactsNum - 2)})
                    };
            }
        })

        const passwordUpdatedInfo = computed(() => {
            if (isUserNull.value || !user.value.security.passwordUpdatedDate) return '';
            return t('security_page.actions.password.text_line1', {
                year: user.value.security.passwordUpdatedDate.year,
                month: user.value.security.passwordUpdatedDate.month,
                day: user.value.security.passwordUpdatedDate.day
            })
        })

        const tokenInfo = computed(() => {
            if (isUserNull.value || !user.value.security.accountSecurityTokenNum) return '';
            return t('security_page.actions.security.text_line2', {num: user.value.security.accountSecurityTokenNum})
        })

        const notificationEmail = computed(() => {
            if (isUserNull.value || !user.value.security.notificationEmail) return '';
            return user.value.security.notificationEmail;
        })

        const passkeysInfo = computed(() => {
            if (isUserNull.value || !user.value.security.passkeysNum) return '';
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
                id: actionsIds.value.securityActions[0],
                title: t('security_page.actions.email_mobile.title'),
                icon: ApolloLogoBlue,
                text_line1: contactsInfo.value.line1,//'201824101323@hainnu.edu.cn',
                text_line2: contactsInfo.value.line2,
                text_line3: contactsInfo.value.line3
            },
            {
                id: actionsIds.value.securityActions[1],
                title: t('security_page.actions.password.title'),
                icon: PasswordIcon,
                text_line1: passwordUpdatedInfo.value
            },
            {
                id: actionsIds.value.securityActions[2],
                title: t('security_page.actions.security.title'),
                icon: SecurityIcon,
                text_line1: t('security_page.actions.security.text_line1'),
                text_line2: tokenInfo.value
            },
            {
                id: actionsIds.value.securityActions[3],
                title: t('security_page.actions.notification_email.title'),
                icon: EmailIcon,
                text_line1: notificationEmail.value,
            },
            {
                id: actionsIds.value.securityActions[4],
                title: t('security_page.actions.passkeys.title'),
                icon: PasskeysIcon,
                text_line1: passkeysInfo.value
            },
            {
                id: actionsIds.value.securityActions[5],
                title: t('security_page.actions.third_party_account.title'),
                icon: ThirdPartyIcon,
                text_line1: thirdPartyAccountsInfo.value.line1,
                text_line2: thirdPartyAccountsInfo.value.line2
            },
            {
                id: actionsIds.value.securityActions[6],
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

    return {
        user,
        theme,
        isLogin,
        languages, /*userPageItemIndex,*/
        securityPageContent,
        userPasskeysDialogVisible,
        infoPageContent,
        accountInfoShort,
        actionsIds
    }
}, {
    persist: {
        storage: sessionStorage,
        pick: ['user', 'accountInfoShort', 'theme', 'isLogin', 'languages', 'actionsIds'],
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


