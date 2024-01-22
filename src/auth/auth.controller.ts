import { Body, Controller, Post } from '@nestjs/common';
import { TTokens } from 'src/types';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/local/signup')
  async signupLocal(@Body() payload: AuthDto): Promise<TTokens> {
    this.authService.signupLocal(payload);
  }

  @Post('/local/signin')
  signinLocal() {
    this.authService.signinLocal();
  }

  @Post('/logout')
  logout() {
    this.authService.logout();
  }

  @Post('/refresh')
  refreshToken() {
    this.authService.refreshToken();
  }
}
