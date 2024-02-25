import FriendsIconRaw from "$lib/assets/people.svg?raw"
import BlockIconRaw from "$lib/assets/block.svg?raw"

import { useFollowUser, useUnfollowUser, useUserFollowers, useUserFriends } from "$lib/query/friends"
import { authed_user_store as authedUserStore } from "$lib/stores/user"
import { type Readable, writable, get, derived } from "svelte/store"
import { useBlockUser, useBlockedUsers, useUnblockUser } from "$lib/query/user"

interface Action {
  icon: string
  getText(): string
  onClickAction(): void
}

interface Args {
  userId: Readable<string>
  username: Readable<string>
}

function useUserProfileActions({ userId, username }: Args): Readable<Action[]> {
  const [authedUserFriends, authedUserFriendsStore] = useUserFriends(get(authedUserStore)?.id)
  const [authedUserFollowers, authedUserFollowersStore] = useUserFollowers(get(authedUserStore)?.id)
  const [userFollowers, userFollowersStore] = useUserFollowers(get(userId))
  const [authedUserBlockedUsers, authedUserBlockedUsersStore] = useBlockedUsers(get(authedUserStore)?.id)

  const follow = useFollowUser()
  const unfollow = useUnfollowUser()
  const blockUser = useBlockUser()
  const unblockUser = useUnblockUser()

  authedUserStore.subscribe(s => {
    if (s) {
      authedUserFriendsStore.set({ userId: s.id, limit: undefined })
      authedUserFollowersStore.set({ userId: s.id, limit: undefined })
      authedUserBlockedUsersStore.set({ userId: s.id })
    }
  })

  userId.subscribe(id => {
    userFollowersStore.set({ userId: id, limit: undefined })
  })

  const isFriends = writable(false)
  const isFollowedToUser = writable(false)
  const isUserFollowedToYou = writable(false)

  authedUserFriends.subscribe(r => {
    if (r?.data) {
      isFriends.set(r.data.friends.includes(get(userId)))
    }
  })
  authedUserFollowers.subscribe(r => {
    if (r?.data) {
      isUserFollowedToYou.set(get(userId) ? r.data.followers.includes(get(userId)) : false)
    }
  })
  userFollowers.subscribe(r => {
    if (r?.data) {
      const userId = get(authedUserStore)?.id
      isFollowedToUser.set(userId ? r.data.followers.includes(userId) : false)
    }
  })

  const isBlocked = writable(false)

  authedUserBlockedUsers.subscribe(r => {
    if (r?.data) {
      isBlocked.set(r.data.blockedUsers.includes(get(userId)))
    }
  })

  const options: Readable<Action[]> = derived(
    [isFriends, isFollowedToUser, isUserFollowedToYou, isBlocked],
    ([isFriendsV, isFollowedToUserV, isUserFollowedToYouV, isBlockedV]) => [
      {
        icon: FriendsIconRaw,
        getText: () => {
          if (isFriendsV) {
            return "Remove from friends"
          }
          if (isUserFollowedToYouV && !isFollowedToUserV) {
            return "Add to friends"
          }
          if (!isUserFollowedToYouV && !isFollowedToUserV) {
            return "Follow"
          }
          if (!isUserFollowedToYouV && isFollowedToUserV) {
            return "Unfollow"
          }

          return "<Internal Error>: <Uncovered case>"
        },
        onClickAction: () => {
          const getMutatePayload = (text: string) => ({
            userId: get(userId),
            reqUserId: get(authedUserStore)?.id!,
            getSuccessText: () => text,
          })

          // Friend
          if (isFriendsV) {
            isFriends.set(false)
            isUserFollowedToYou.set(true)
            get(unfollow).mutate(getMutatePayload(`Removed ${get(username)} from friends.`))
          }
          // May become friends as user was followed to you
          else if (isUserFollowedToYouV && !isFollowedToUserV) {
            isFriends.set(true)
            get(follow).mutate(getMutatePayload(`Added ${get(username)} to friends.`))
          }
          // Become follower
          else if (!isUserFollowedToYouV && !isFollowedToUserV) {
            isFollowedToUser.set(true)
            get(follow).mutate(getMutatePayload(`Followed ${get(username)}.`))
          }
          // Unfollow
          else if (!isUserFollowedToYouV && isFollowedToUserV) {
            isFollowedToUser.set(false)
            get(unfollow).mutate(getMutatePayload(`Unfollowed ${get(username)}.`))
          }
        },
      },
      {
        icon: BlockIconRaw,
        getText: () => {
          if (isBlockedV) {
            return `Unblock @${get(username)}`
          } else {
            return `Block @${get(username)}`
          }
        },
        onClickAction: () => {
          const getMutatePayload = () => ({ userId: get(userId), requesterId: get(authedUserStore)?.id! })

          if (isBlockedV) {
            get(unblockUser).mutateAsync(getMutatePayload())
          } else {
            get(blockUser).mutateAsync(getMutatePayload())
          }
          isBlockedV ? isBlocked.set(false) : isBlocked.set(true)
        },
      },
    ],
  )

  return options
}

export default useUserProfileActions
