// Thin LinkedIn API client for OAuth + posting on a member's behalf.
// Uses the "Share on LinkedIn" product (w_member_social) + OpenID Connect.

export const LINKEDIN_SCOPES = "openid profile w_member_social";
const AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization";
const TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken";
const USERINFO_URL = "https://api.linkedin.com/v2/userinfo";
const POSTS_URL = "https://api.linkedin.com/rest/posts";
const LINKEDIN_VERSION = "202409";

export function getAuthorizeUrl(redirectUri: string, state: string): string {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  if (!clientId) throw new Error("LINKEDIN_CLIENT_ID is not set.");
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    scope: LINKEDIN_SCOPES,
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export interface LinkedInTokens {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  refresh_token_expires_in?: number;
  scope?: string;
}

export async function exchangeCodeForTokens(code: string, redirectUri: string): Promise<LinkedInTokens> {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("LinkedIn client credentials are not set.");
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Token exchange failed: ${res.status} ${t}`);
  }
  return (await res.json()) as LinkedInTokens;
}

export interface LinkedInUserInfo {
  sub: string;
  name?: string;
  email?: string;
}

export async function getUserInfo(accessToken: string): Promise<LinkedInUserInfo> {
  const res = await fetch(USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Userinfo failed: ${res.status} ${t}`);
  }
  return (await res.json()) as LinkedInUserInfo;
}

// Publishes a text post to the member's feed. Returns the LinkedIn post URN.
export async function publishTextPost(accessToken: string, memberSub: string, text: string): Promise<string> {
  const payload = {
    author: `urn:li:person:${memberSub}`,
    commentary: text,
    visibility: "PUBLIC",
    distribution: {
      feedDistribution: "MAIN_FEED",
      targetEntities: [],
      thirdPartyDistributionChannels: [],
    },
    lifecycleState: "PUBLISHED",
    isReshareDisabledByAuthor: false,
  };
  const res = await fetch(POSTS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "LinkedIn-Version": LINKEDIN_VERSION,
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify(payload),
  });
  if (res.status !== 200 && res.status !== 201) {
    const t = await res.text();
    throw new Error(`LinkedIn post failed: ${res.status} ${t}`);
  }
  // The created post URN comes back in the x-restli-id header.
  return res.headers.get("x-restli-id") || res.headers.get("x-linkedin-id") || "";
}
