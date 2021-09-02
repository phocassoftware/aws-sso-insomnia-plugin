import { CredentialProvider, Credentials } from "@aws-sdk/types";
import {
  FromSSOInit,
  SsoCredentialsParameters,
} from "@aws-sdk/credential-provider-sso";

type ProfileDetails = {
  name: string;
  provider: CredentialProvider;
  credentials: Credentials;
};

export type CredentialProviderFactory = (
  init?: (FromSSOInit & Partial<SsoCredentialsParameters>) | undefined
) => CredentialProvider;

export class SsoCredentialsCache {
  private readonly profiles = new Map<string, ProfileDetails>();
  private readonly factory: CredentialProviderFactory;

  constructor(factory: CredentialProviderFactory) {
    this.profiles = new Map<string, ProfileDetails>();
    this.factory = factory;
  }

  async get(profile: string) {
    let details = await this.getProfileDetails(profile);
    return await this.getFreshCredentials(details);
  }

  private async getProfileDetails(profile: string) {
    let details = this.profiles.get(profile);
    if (details === undefined) {
      // Only create the SSO Provider once per profile
      let provider = this.factory({ profile: profile });
      details = {
        name: profile,
        provider: provider,
        credentials: await provider(),
      };
      this.profiles.set(profile, details);
    }
    return details;
  }

  private async getFreshCredentials(details: ProfileDetails) {
    if (
      details.credentials &&
      details.credentials.expiration &&
      details.credentials.expiration < new Date()
    ) {
      // If we have expired credentials, refresh
      details = {
        name: details.name,
        provider: details.provider,
        credentials: await details.provider(),
      };
      this.profiles.set(details.name, details);
    }
    return details.credentials;
  }
}
