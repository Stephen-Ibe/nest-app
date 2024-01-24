import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { Tokens } from 'src/types';
import { AuthDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Description - Register a new user
   * @param {any} payload:AuthDto
   * @returns {any}
   */
  async signupLocal(payload: AuthDto): Promise<Tokens> {
    const hash = await this.hashData(payload.password);
    const newUser = await this.prismaService.user.create({
      data: {
        email: payload.email,
        hash,
      },
    });

    const tokens = await this.getTokens(newUser.id, newUser.email);
    await this.updateRefreshTokenHash(newUser.id, tokens.refresh_token);
    return tokens;
  }

  /**
   * Description - Login exisiting user
   * @param {any} payload:AuthDto
   * @returns {any}
   */
  async signinLocal(payload: AuthDto): Promise<Tokens> {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: payload.email,
      },
    });
    if (!user) throw new ForbiddenException('Access Denied');

    const passwordMatches = await bcrypt.compare(payload.password, user.hash);
    if (!passwordMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshTokenHash(user.id, tokens.refresh_token);
    return tokens;
  }

  /**
   * Description - Logout user
   * @param {any} userId:number
   * @returns {any}
   */
  async logout(userId: number): Promise<boolean> {
    await this.prismaService.user.updateMany({
      where: {
        id: userId,
        hashedRt: {
          not: null,
        },
      },
      data: {
        hashedRt: null,
      },
    });

    return true;
  }

  async refreshToken(userId: number, refreshToken: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) throw new ForbiddenException('Access Denied');

    const refreshTokensMatch = await bcrypt.compare(
      refreshToken,
      user.hashedRt,
    );
    if (!refreshTokensMatch) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshTokenHash(user.id, tokens.refresh_token);
    return tokens;
  }

  hashData(data: string) {
    return bcrypt.hash(data, 10);
  }

  async getTokens(userId: number, email: string): Promise<Tokens> {
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        { expiresIn: 60 * 15, secret: 'at-secret' },
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        { expiresIn: 60 * 60 * 24 * 7, secret: 'rt-secret' },
      ),
    ]);

    return { access_token, refresh_token };
  }

  async updateRefreshTokenHash(userId: number, refreshToken: string) {
    const hash = await this.hashData(refreshToken);
    await this.prismaService.user.update({
      where: { id: userId },
      data: { hashedRt: hash },
    });
  }
}
