import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  AtGuard,
  GetCurrentUser,
  GetCurrentUserId,
  Public,
  RtGuard,
} from 'src/common';
import { Tokens } from 'src/types';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('local/signup')
  @HttpCode(HttpStatus.CREATED)
  signupLocal(@Body() payload: AuthDto): Promise<Tokens> {
    return this.authService.signupLocal(payload);
  }

  @Public()
  @Post('local/signin')
  @HttpCode(HttpStatus.OK)
  signinLocal(@Body() payload: AuthDto): Promise<Tokens> {
    return this.authService.signinLocal(payload);
  }

  @UseGuards(AtGuard)
  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  logout(@GetCurrentUserId() userId: number) {
    return this.authService.logout(userId);
  }

  @UseGuards(RtGuard)
  @Post('/refresh')
  @HttpCode(HttpStatus.OK)
  refreshToken(
    @GetCurrentUserId() userId: number,
    @GetCurrentUser('refreshToken') refreshToken: string,
  ) {
    return this.authService.refreshToken(userId, refreshToken);
  }
}
