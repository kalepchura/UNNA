import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  // Importamos UsuariosModule para usar UsuariosService dentro de AuthService.
  imports: [UsuariosModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}