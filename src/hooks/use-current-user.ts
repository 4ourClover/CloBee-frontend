import { useEffect, useState } from "react"

export function useCurrentUser() {
  const [user, setUser] = useState<{ userId: number } | null>(null)

  // useEffect(() => {
  //   if (user) {
  //     console.log("userId 변경:", user.userId);
  //   }
  // }, [user]);

  useEffect(() => {
    fetch(process.env.REACT_APP_API_BASE_URL + "/user/me", {
      credentials: "include", // 쿠키 기반 로그인이라면 반드시 필요
    })
      .then((res) => res.json())
      .then((data) => setUser({ userId: data.userId }))
      .catch(() => setUser(null))
  }, [])

  return user
}