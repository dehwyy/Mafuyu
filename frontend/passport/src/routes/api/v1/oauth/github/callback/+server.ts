import { redirect, type RequestHandler } from "@sveltejs/kit"
import { GrpcClient, Interceptors } from "@makoto/grpc"

export const GET: RequestHandler = async ({ url, cookies, setHeaders }) => {
  const code = url.searchParams.get("code")
  const csrfToken = url.searchParams.get("state")

  if (code === null || csrfToken === null)
    new Response(null, {
      status: 400,
    })

  const { response, headers } = await GrpcClient.signInOAuth2(
    {
      csrfToken: csrfToken!,
      code: code!,
      provider: "github",
    },
    {
      interceptors: [Interceptors.WithTokens(Interceptors.WithTokensPayload.CreateForSvelteKit(cookies))],
    },
  )

  redirect(302, `/@${response.username}`)
}
