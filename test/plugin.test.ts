import { describe, expect, test } from "vitest";
import { mock } from "vitest-mock-extended";

import { fetchCredentialsByProfile } from "../dist/plugin";
import { SsoCredentialsCache } from "../dist/sso-credentials-cache";

describe("Plugin Tests", () => {
  test("Correct Credential Property Is Returned", async () => {
    let ssoCredentialsCache = mock<SsoCredentialsCache>();
    ssoCredentialsCache.get.mockResolvedValue({
      accessKeyId: "A",
      secretAccessKey: "B",
      sessionToken: "C",
      expiration: undefined,
    });
    let result = await fetchCredentialsByProfile(
      ssoCredentialsCache,
      "one",
      "accessKeyId"
    );
    expect(result).toBe("A");

    result = await fetchCredentialsByProfile(
      ssoCredentialsCache,
      "one",
      "secretAccessKey"
    );
    expect(result).toBe("B");

    result = await fetchCredentialsByProfile(
      ssoCredentialsCache,
      "one",
      "sessionToken"
    );
    expect(result).toBe("C");

    expect(ssoCredentialsCache.get).toBeCalledWith("one");
    expect(ssoCredentialsCache.get).toBeCalledTimes(3);
  });
});
