import type { LayoutServerLoad } from "./$types"
import GrpcServerClient from "$lib/query/grpc/server"
import { queryClient } from "$lib/query-client"
import { getUserInfoQuery } from "$lib/query/user"
import { getUserProfileScopesQuery } from "$lib/query/profile"
import { getBlockedUsersQuery } from "$lib/query/user"
import { dehydrate } from "@tanstack/svelte-query"
import { StaleTime } from "$lib/const"

export const load: LayoutServerLoad = async ({ cookies, params, parent }) => {
  const withUserPromise = new Promise(async r => {
    const username = params.username

    const response = await queryClient.fetchQuery({
      ...getUserInfoQuery({ oneofKind: "username", username }, GrpcServerClient(0, cookies)),
    })

    const getAuthedUserScopesForRequestedUserPromise = queryClient.prefetchQuery({
      ...getUserProfileScopesQuery(response?.userId, GrpcServerClient(0, cookies)),
    })

    const getBlockedUsersPromise = queryClient.prefetchQuery({
      ...getBlockedUsersQuery(response?.userId, GrpcServerClient(0, cookies)),
    })

    await Promise.all([getAuthedUserScopesForRequestedUserPromise, getBlockedUsersPromise])

    r({})
  })

  const withAuthedUserPromise = new Promise(async r => {
    const { userId: authedUserId } = await parent()

    await queryClient.prefetchQuery({
      ...getBlockedUsersQuery(authedUserId, GrpcServerClient(StaleTime.MINUTE * 0, cookies)),
    })

    r({})
  })

  await Promise.all([withUserPromise, withAuthedUserPromise])

  return structuredClone({
    dehydrateState: dehydrate(queryClient),
  })
}
