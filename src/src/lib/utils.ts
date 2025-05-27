import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

// cn 함수는 여러 CSS 클래스 이름을 받아서 하나의 깔끔한 문자열로 만들어주는 도우미 함수입니다.

// clsx: 여러 클래스를 합쳐주고, 조건에 따라 클래스를 넣거나 빼기 편하게 해줘요.
// twMerge: Tailwind CSS 클래스끼리 충돌하면, Tailwind 규칙에 맞춰서 제대로 스타일이 적용되도록 합쳐줘요.