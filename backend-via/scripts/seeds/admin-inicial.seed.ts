import { DataSource } from 'typeorm';
import { createClient } from '@supabase/supabase-js';
import { UsuarioApp } from '../../src/modules/usuarios/entities/usuario-app.entity';
import { RolUsuario } from '../../src/common/enums';

/**
 * Crea el primer ADMINISTRADOR del sistema.
 * Solo se ejecuta si no existe ningún admin todavía.
 */
const CORREO_ADMIN = '  ';
const PASSWORD_ADMIN = 'CambiarEstoYa123!';
const NOMBRE_ADMIN = 'Administrador Inicial';

export async function seedAdminInicial(ds: DataSource): Promise<void> {
  console.log('  → Verificando admin inicial...');
  const repo = ds.getRepository(UsuarioApp);

  // Si ya existe algún admin activo, salimos
  const existeAdmin = await repo.findOne({
    where: { rol: RolUsuario.ADMINISTRADOR, activo: true },
  });
  if (existeAdmin) {
    console.log('     ya existe un administrador activo, salteando');
    return;
  }

  // Cliente Supabase con SERVICE_ROLE_KEY
  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  // Crear en Supabase Auth
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: CORREO_ADMIN,
    password: PASSWORD_ADMIN,
    email_confirm: true,
    user_metadata: { nombre: NOMBRE_ADMIN },
  });

  if (error || !data.user) {
    // Si el usuario ya existe en Supabase Auth (pero no en usuarios_app),
    // intentamos buscarlo y solo persistirlo en usuarios_app.
    if (error?.message?.includes('already')) {
      console.warn(`     ⚠️  Usuario ya existe en Supabase Auth (${CORREO_ADMIN}). Persistiendo solo en usuarios_app.`);
      // Buscar el usuario existente
      const { data: lista } = await supabaseAdmin.auth.admin.listUsers();
      const existente = lista?.users?.find((u) => u.email === CORREO_ADMIN);
      if (!existente) throw new Error('No se pudo encontrar el usuario en Supabase Auth');
      await repo.save(repo.create({
        id: existente.id,
        nombre: NOMBRE_ADMIN,
        correo: CORREO_ADMIN,
        rol: RolUsuario.ADMINISTRADOR,
        activo: true,
      }));
      console.log(`     ✅ Admin inicial registrado en usuarios_app: ${CORREO_ADMIN}`);
      return;
    }
    throw new Error(`Error creando admin en Supabase Auth: ${error?.message}`);
  }

  // Persistir en usuarios_app
  await repo.save(repo.create({
    id: data.user.id,
    nombre: NOMBRE_ADMIN,
    correo: CORREO_ADMIN,
    rol: RolUsuario.ADMINISTRADOR,
    activo: true,
  }));

  console.log(`     ✅ Admin inicial creado: ${CORREO_ADMIN} / ${PASSWORD_ADMIN}`);
  console.log(`     ⚠️  CAMBIA ESTA CONTRASEÑA DESPUÉS DEL PRIMER LOGIN`);
}