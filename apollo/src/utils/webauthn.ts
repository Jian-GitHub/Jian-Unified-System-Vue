function decodeBase64Url(value: string): ArrayBuffer {
    const padded = value.padEnd(value.length + (4 - value.length % 4) % 4, '=')
    const binary = atob(padded.replace(/-/g, '+').replace(/_/g, '/'))
    return Uint8Array.from(binary, char => char.charCodeAt(0)).buffer
}

function encodeBase64Url(value: ArrayBuffer | null): string | null {
    if (value === null) return null
    const bytes = new Uint8Array(value)
    let binary = ''
    for (let offset = 0; offset < bytes.length; offset += 0x8000) {
        binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000))
    }
    return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

export function parseCreationOptions(optionsJson: string): PublicKeyCredentialCreationOptions {
    const parsed = JSON.parse(optionsJson)
    const options = parsed.publicKey || parsed
    return {
        ...options,
        challenge: decodeBase64Url(options.challenge),
        user: {...options.user, id: decodeBase64Url(options.user.id)},
        excludeCredentials: options.excludeCredentials?.map((item: { id: string; type: PublicKeyCredentialType; transports?: AuthenticatorTransport[] }) => ({
            ...item,
            id: decodeBase64Url(item.id),
        })),
    }
}

export function parseRequestOptions(optionsJson: string): PublicKeyCredentialRequestOptions {
    const parsed = JSON.parse(optionsJson)
    const options = parsed.publicKey || parsed
    return {
        ...options,
        challenge: decodeBase64Url(options.challenge),
        allowCredentials: options.allowCredentials?.map((item: { id: string; type: PublicKeyCredentialType; transports?: AuthenticatorTransport[] }) => ({
            ...item,
            id: decodeBase64Url(item.id),
        })),
    }
}

export function serializeRegistrationCredential(credential: PublicKeyCredential) {
    const response = credential.response as AuthenticatorAttestationResponse
    return {
        id: credential.id,
        type: credential.type,
        rawId: encodeBase64Url(credential.rawId),
        authenticatorAttachment: credential.authenticatorAttachment,
        clientExtensionResults: credential.getClientExtensionResults(),
        response: {
            clientDataJSON: encodeBase64Url(response.clientDataJSON),
            attestationObject: encodeBase64Url(response.attestationObject),
            transports: response.getTransports?.(),
        },
    }
}

export function serializeAuthenticationCredential(credential: PublicKeyCredential) {
    const response = credential.response as AuthenticatorAssertionResponse
    return {
        id: credential.id,
        type: credential.type,
        rawId: encodeBase64Url(credential.rawId),
        authenticatorAttachment: credential.authenticatorAttachment,
        clientExtensionResults: credential.getClientExtensionResults(),
        response: {
            clientDataJSON: encodeBase64Url(response.clientDataJSON),
            authenticatorData: encodeBase64Url(response.authenticatorData),
            signature: encodeBase64Url(response.signature),
            userHandle: encodeBase64Url(response.userHandle),
        },
    }
}
