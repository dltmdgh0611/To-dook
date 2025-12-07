import { Checkout } from "@polar-sh/nextjs";

export const GET = Checkout({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  successUrl: process.env.POLAR_SUCCESS_URL,
  // server: "sandbox", // sandbox 토큰 사용 시에만 주석 해제
});

