import { fromSSO } from "@aws-sdk/credential-provider-sso";
import { CredentialProvider, Credentials } from "@aws-sdk/types";

enum CredentialPropertyEnum {
    accessKeyId,
    secretAccessKey,
    sessionToken
}

type CredentialProperty = keyof typeof CredentialPropertyEnum;

let currentProfile : string;
let provider : CredentialProvider;
let credentials : Credentials;

export const templateTags = [
    {
        name: 'aws_sso',
        displayName: 'AWS SSO',
        liveDisplayName: (args: any) => {
            return `${args[0].value} - ${args[1].value}`;
        },
        description: 'AWS SSO Credential Loader',
        args: [
            {
                displayName: 'Profile',
                type: 'string',
                defaultValue: 'default',
                modelType: 'model'
            }, {
                displayName: 'Item',
                type: 'enum',
                options: [
                    {
                        displayName: 'Access Key Id',
                        value: CredentialPropertyEnum[CredentialPropertyEnum.accessKeyId],
                    },
                    {
                        displayName: 'Secret Access Key',
                        value: CredentialPropertyEnum[CredentialPropertyEnum.secretAccessKey],
                    },
                    {
                        displayName: 'Session Token',
                        value: CredentialPropertyEnum[CredentialPropertyEnum.sessionToken],
                    },
                ]
            }
        ],
        async run(_context: object, profile: string, property: CredentialProperty) {
            if (currentProfile !== profile) {
                // Update the current profile and provider only when profile has changed
                currentProfile = profile;
                provider = fromSSO({ profile: profile });
                credentials = await provider();
            }
            if (credentials &&
                credentials.expiration &&
                credentials.expiration < new Date()) {
                // If we have expired credentials, refresh
                credentials = await provider();
            }
            return credentials[property];
        },
    }
];