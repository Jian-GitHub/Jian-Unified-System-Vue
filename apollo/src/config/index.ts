
const api: string = '/api';
const apiVersion: string = '/v1';
const apiUrlPrefix: string = api + apiVersion;
const apiAccountPrefix: string = apiUrlPrefix + '/account';
const apiAccountSecurityPrefix: string = apiAccountPrefix + '/security';

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
            }
        }
    }
}