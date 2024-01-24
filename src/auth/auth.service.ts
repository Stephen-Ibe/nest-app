import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { Tokens } from 'src/types';
import { AuthDto } from './dto';

@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService) {}

  hashData(data: string) {
    return bcrypt.hash(data, 10);
  }

  async signupLocal(payload: AuthDto): Promise<Tokens> {
    const hash = await this.hashData(payload.password);
    const newUser = this.prismaService.user.create({
      data: {
        email: payload.email,
        hash,
      },
    });

    return payload;
  }

  signinLocal() {}

  logout() {}

  refreshToken() {}
}
