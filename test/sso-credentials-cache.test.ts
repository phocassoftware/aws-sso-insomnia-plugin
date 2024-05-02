import { CredentialProvider, Credentials } from "@aws-sdk/types";
import { Mock, describe, expect, test, vi } from "vitest";
import { any, mock, mockFn } from "vitest-mock-extended";

import {
  SsoCredentialsCache,
  CredentialProviderFactory,
} from "../src/sso-credentials-cache";

interface MockCredentials {
  readonly accessKeyId: Mock<[], string>;
  readonly secretAccessKey: Mock<[], string>;
  readonly sessionToken: Mock<[], string | undefined>;
  readonly expiration: Mock<[], Date | undefined>;
}

function mockProperty<T>(base: object, property: keyof Credentials) {
  const getter = vi.fn<[], T>();
  Object.defineProperty(base, property, { get: getter });
  return getter;
}

function setupMockCredentials(
  input: Credentials
): [Credentials, MockCredentials] {
  const base = {};
  const credentials = mock<Credentials>(base);
  const credentialProperties = {
    accessKeyId: mockProperty<string>(base, "accessKeyId"),
    secretAccessKey: mockProperty<string>(base, "secretAccessKey"),
    sessionToken: mockProperty<string | undefined>(base, "sessionToken"),
    expiration: mockProperty<Date | undefined>(base, "expiration"),
  };
  credentialProperties.accessKeyId.mockReturnValue(input.accessKeyId);
  credentialProperties.secretAccessKey.mockReturnValue(input.secretAccessKey);
  credentialProperties.sessionToken.mockReturnValue(input.sessionToken);
  credentialProperties.expiration.mockReturnValue(input.expiration);
  return [credentials, credentialProperties];
}

function setup(
  input: Credentials = {
    accessKeyId: "FOO",
    secretAccessKey: "BAR",
    sessionToken: "BAZ",
    expiration: new Date(8640000000000000),
  }
): [
  SsoCredentialsCache,
  CredentialProviderFactory,
  CredentialProvider,
  MockCredentials
] {
  const factory = mockFn<CredentialProviderFactory>();
  const provider = mockFn<CredentialProvider>();
  const [credentials, mockCredentials] = setupMockCredentials(input);
  const cache = new SsoCredentialsCache(factory);
  provider.mockResolvedValue(credentials);
  factory.calledWith(any()).mockReturnValue(provider);
  return [cache, factory, provider, mockCredentials];
}

describe("SSO Credentials Cache Tests", () => {
  test("Current Session Is Cached Per Profile", async () => {
    let [cache, , provider] = setup();

    await cache.get("one");
    await cache.get("one");
    expect(provider).toBeCalledTimes(1);
  });

  test("Provider Factory Invoked At Most Once Per Profile", async () => {
    let [cache, factory] = setup();

    await cache.get("one");
    await cache.get("one");

    expect(factory).toBeCalledWith({ profile: "one" });
    expect(factory).toBeCalledTimes(1);

    await cache.get("two");

    expect(factory).toBeCalledWith({ profile: "two" });
    expect(factory).toBeCalledTimes(2);
  });

  test("Credential Expiration Is Always Inspected", async () => {
    let [cache, , , credentials] = setup();

    await cache.get("one");
    expect(credentials.expiration).toBeCalledTimes(2);

    await cache.get("one");
    expect(credentials.expiration).toBeCalledTimes(4);
  });

  test("New Credentials Are Provided Only When Expired", async () => {
    const expiration = new Date();
    expiration.setDate(expiration.getDate() + 1);

    const [cache, , provider] = setup({
      accessKeyId: "A",
      secretAccessKey: "B",
      sessionToken: "C",
      expiration: expiration,
    });

    await cache.get("one");
    expect(provider).toBeCalledTimes(1);

    expiration.setDate(expiration.getDate() - 2);

    await cache.get("one");
    expect(provider).toBeCalledTimes(2);

    expiration.setDate(expiration.getDate() + 2);

    await cache.get("one");
    expect(provider).toBeCalledTimes(2);
  });
});
