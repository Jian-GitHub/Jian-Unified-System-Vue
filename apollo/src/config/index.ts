
const api: string = '/api';
const apiVersion: string = '/v1';
const apiUrlPrefix: string = api + apiVersion;
const apiAccountPrefix: string = apiUrlPrefix + '/account';
const apiPasskeysPrefix: string = apiUrlPrefix + '/passkeys';
const apiThirdPartyPrefix: string = apiUrlPrefix + '/thirdParty';

const apiAccountSecurityPrefix: string = apiAccountPrefix + '/security';
const apiPasskeysRegistrationPrefix: string = apiPasskeysPrefix + '/registration';
const apiPasskeysLoginPrefix: string = apiPasskeysPrefix + '/login';

export const Server = {
    service: {
        account: {
            login: apiAccountPrefix + '/login',
            register: apiAccountPrefix + '/registration',
            verifyToken: apiAccountPrefix + '/VerifyToken',
            getUserInfoShort: apiAccountPrefix + '/VerifyToken',
            getUserInfo: apiAccountPrefix + '/GetUserInfo',
            getUserSecurity: apiAccountPrefix + '/GetUserSecurityInfo',
            security: {
                subsystemToken: {
                    getTenSubsystemToken: apiAccountSecurityPrefix + '/GetTenSubsystemTokens',
                    generateSubsystemToken: apiAccountSecurityPrefix + '/GenerateSubsystemToken',
                }
            },
            passkeys: {
                register: {
                    start: apiPasskeysRegistrationPrefix + '/start',
                    finish: apiPasskeysRegistrationPrefix + '/finish',
                },
                login: {
                    start: apiPasskeysLoginPrefix + '/start',
                    finish: apiPasskeysLoginPrefix + '/finish',
                },
            },
            thirdParty: {
                getInfo: apiThirdPartyPrefix + '/GetInfo',
                continue: apiThirdPartyPrefix + '/Continue',
                bind: apiThirdPartyPrefix + '/Bind',
                remove: apiThirdPartyPrefix + '/Remove',
            }
        },
    }
}