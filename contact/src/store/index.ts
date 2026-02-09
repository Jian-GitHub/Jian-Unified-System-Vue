
const store = {
  urls: {
    token: {
      getByCode: '/api/token/getByCode',
      verify: '/api/token/verify',
    },
    passkeys: {
      registration: {
        request: '/api/passkeys/registration/request',
        finish: '/api/passkeys/registration/finish'
      },
      login: {
        request: '/api/passkeys/login/request',
        finish: '/api/passkeys/login/finish'
      }
    }
  },
  loginPageURL: 'https://account.JianUnifiedSystem.com/login'
};

export default store;
