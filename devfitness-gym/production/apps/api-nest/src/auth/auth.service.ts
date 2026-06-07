import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService) {}

  async login(username: string, password: string) {
    const expectedUser = process.env.ADMIN_USERNAME || "admin";
    const hash = process.env.ADMIN_PASSWORD_HASH;
    const ok = username === expectedUser && (hash ? await bcrypt.compare(password, hash) : password === (process.env.ADMIN_PASSWORD || "devfitness"));
    if (!ok) throw new UnauthorizedException("Invalid username or password");
    return this.jwt.sign({ sub: username });
  }
}
