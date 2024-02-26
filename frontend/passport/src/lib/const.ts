export const enum Routes {
  Login = "/login/",
  Create = "/create/",
  RecoverPassword = "/recover/password/",
  Account = "/",
  Logout = "/logout/",
  Circle = "/circle/",
}

export class CreateNavigation {
  static ToUser(username: string, dyn: string = ""): string {
    return `${Routes.Account}@${username}${dyn}`
  }
  static ToFriends(username: string): string {
    return `${Routes.Account}@${username}/self?section=friends`
  }
  static ToFollowers(username: string): string {
    return `${Routes.Account}@${username}/self?section=followers`
  }
  static ToGoogleIntegration(username: string): string {
    return `${Routes.Account}@${username}/google`
  }
  static ToGithubIntegration(username: string): string {
    return `${Routes.Account}@${username}/github`
  }
}

interface Language {
  language: string
  emoji_icon: string
}

export const MostPopularLanguage: Language[] = [
  { language: "Arabic", emoji_icon: "🇦🇪" },
  { language: "Dutch", emoji_icon: "🇩🇰" },
  { language: "English", emoji_icon: "🇺🇸" },
  { language: "French", emoji_icon: "🇫🇷" },
  { language: "German", emoji_icon: "🇩🇪" },
  { language: "Hindi", emoji_icon: "🇮🇳" },
  { language: "Indonesian", emoji_icon: "🇮🇩" },
  { language: "Italian", emoji_icon: "🇮🇹" },
  { language: "Japanese", emoji_icon: "🇯🇵" },
  { language: "Korean", emoji_icon: "🇰🇷" },
  { language: "Chinese", emoji_icon: "🇨🇳" },
  { language: "Polish", emoji_icon: "🇵🇱" },
  { language: "Portuguese", emoji_icon: "🇵🇹" },
  { language: "Russian", emoji_icon: "🇷🇺" },
  { language: "Spanish", emoji_icon: "🇪🇸" },
  { language: "Thai", emoji_icon: "🇹🇭" },
  { language: "Turkish", emoji_icon: "🇹🇷" },
]

export const enum DevFallbackImages {
  VerticalOriented = "/images/r.jpg",
  HorizontalOriented = "/images/hana.png",
}

export const enum StaleTime {
  SECOND = 1000,
  MINUTE = 60 * StaleTime.SECOND,
  HOUR = 60 * StaleTime.MINUTE,
}
