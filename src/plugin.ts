import { fromSSO } from "@aws-sdk/credential-provider-sso";
import { SsoCredentialsCache } from "./sso-credentials-cache";

const ssoCredentialsCache = new SsoCredentialsCache(fromSSO);

export enum CredentialPropertyEnum {
  accessKeyId,
  secretAccessKey,
  sessionToken,
}

export type CredentialProperty = keyof typeof CredentialPropertyEnum;

export async function fetchCredentialsByProfile(
  cache: SsoCredentialsCache,
  profile: string,
  property: CredentialProperty
) {
  let credentials = await cache.get(profile);
  return credentials[property];
}

export const templateTags = [
  {
    name: "aws_sso",
    displayName: "AWS SSO",
    liveDisplayName: (args: any) => {
      return `${args[0].value} - ${args[1].value}`;
    },
    description: "Credential Loader",
    args: [
      {
        displayName: "Profile",
        type: "string",
        defaultValue: "default",
        modelType: "model",
      },
      {
        displayName: "Item",
        type: "enum",
        options: [
          {
            displayName: "Access Key Id",
            value: CredentialPropertyEnum[CredentialPropertyEnum.accessKeyId],
          },
          {
            displayName: "Secret Access Key",
            value:
              CredentialPropertyEnum[CredentialPropertyEnum.secretAccessKey],
          },
          {
            displayName: "Session Token",
            value: CredentialPropertyEnum[CredentialPropertyEnum.sessionToken],
          },
        ],
      },
    ],
    async run(_context: object, profile: string, property: CredentialProperty) {
      return await fetchCredentialsByProfile(
        ssoCredentialsCache,
        profile,
        property
      );
    },
  },
];
