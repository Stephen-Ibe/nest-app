export type JwtPayload = {
  email: string;
  sub: number;
};

export type JwtRTPayload = JwtPayload & { refreshToken: string };
