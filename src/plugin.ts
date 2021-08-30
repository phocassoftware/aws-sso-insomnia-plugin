import { fromSSO } from "@aws-sdk/credential-provider-sso";
import { CredentialProvider, Credentials } from "@aws-sdk/types";

enum CredentialPropertyEnum {
    accessKeyId,
    secretAccessKey,
    sessionToken
}

type CredentialProperty = keyof typeof CredentialPropertyEnum;
type ProfileDetails = {
    name : string,
    provider : CredentialProvider;
    credentials : Credentials;
}

let profiles = new Map<string, ProfileDetails>();

async function getProfileDetails(profile: string) {
    let details = profiles.get(profile);
    if (details === undefined) {
        // Only create the SSO Provider once per profile
        let provider = fromSSO({profile: profile});
        details = {
            name : profile,
            provider : provider,
            credentials : await provider()
        }
        profiles.set(profile, details);
    }
    return details;
}

async function getFreshCredentials(details: ProfileDetails) {
    if (details.credentials &&
        details.credentials.expiration &&
        details.credentials.expiration < new Date()) {
        // If we have expired credentials, refresh
        details = {
            name : details.name,
            provider : details.provider,
            credentials : await details.provider()
        };
        profiles.set(details.name, details);
    }
    return details.credentials;
}

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
            let details = await getProfileDetails(profile);
            let credentials = await getFreshCredentials(details);
            return credentials[property];
        },
    }
];