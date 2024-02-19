import { writable } from "svelte/store"

interface IUser {
  id: string
  username: string
}

interface IDynUser {
  picture?: string
  pseudonym?: string
}

export const authed_user_store = writable<IUser | null>(null)
export const dyn_user_store = writable<IDynUser | null>(null)

export const clear_user = () => {
  authed_user_store.set(null)
  dyn_user_store.set(null)
}
