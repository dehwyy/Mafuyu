import type { LayoutServerLoad } from "./$types"
import { GrpcClient, Interceptors } from "@makoto/grpc"
import { GrpcCookiesKeys } from "@makoto/grpc/const"

export const load: LayoutServerLoad = async ({ cookies, url, setHeaders }) => {
  if (!cookies.get(GrpcCookiesKeys.AccessToken) && !cookies.get(GrpcCookiesKeys.RefreshToken))
    return {
      url: url.pathname,
    }

  try {
    const { response, headers } = await GrpcClient.signInWithToken(
      {
        token: "", // will be set in interceptor
      },
      {
        interceptors: [Interceptors.WithTokens(Interceptors.WithTokensPayload.CreateForSvelteKit(cookies))],
        timeout: 5000, // secs
      },
    )

    console.log(headers["x-access-token"]!)
    return {
      userId: response.userId,
      username: response.username,
      url: url.pathname,
    }
  } catch (e) {
    console.log(e)

    return {
      url: url.pathname,
    }
  }
}
