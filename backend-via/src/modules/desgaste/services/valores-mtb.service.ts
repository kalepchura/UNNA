import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { EscenariosMtbRepository } from '../repositories/escenarios-mtb.repository';
import { MtbEscenarioRepository } from '../repositories/mtb-escenario.repository';
import { GuardarValoresMtbDto } from '../dto/mtb-escenario/guardar-valores-mtb.dto';
import { GuardarValoresMtbResponseDto } from '../dto/mtb-escenario/guardar-valores-mtb-response.dto';
import {
  ValoresMtbResponseDto,
  ValorMtbDto,
} from '../dto/mtb-escenario/valores-mtb-response.dto';
import { calcularMtbAcumulado } from '../helpers/mtb-acumulado.helper';

import { AuditoriaService } from '../../auditoria/services/auditoria.service';
import { registrarAuditoria } from '../../auditoria/helpers/auditoria.helper';
import {
  ModuloAuditoria,
  OperacionAuditoria,
} from '../../../common/enums';
import { AuthenticatedUser } from '../../../common/interfaces/authenticated-user.interface';

/**
 * ============================================================
 * ValoresMtbService
 * ============================================================
 * Maneja los valores anuales MTB de un escenario.
 *
 * Operaciones:
 *  1. listarValoresPorEscenario(): GET con MTB acumulado calculado
 *  2. guardarCambios(): UPSERT/DELETE batch desde el delta
 *
 * Auditoría: 1 BULK_LOAD por sesión de carga, en módulo DESGASTE,
 * referenciando al escenario padre como entidadId.
 *
 * NOTA: la auditoría va asociada al ESCENARIO padre (no a los
 * valores individuales) porque el informe dice que MtbEscenario
 * "no tiene auditoría propia, depende del escenario padre".
 * ============================================================
 */
@Injectable()
export class ValoresMtbService {
  private readonly NOMBRE_ENTIDAD_PADRE = 'EscenarioMTB';

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly escenariosRepo: EscenariosMtbRepository,
    private readonly valoresRepo: MtbEscenarioRepository,
    private readonly auditoria: AuditoriaService,
  ) {}

  // ----------------------------------------------------------
  // LISTAR
  // ----------------------------------------------------------

  /**
   * Lista los valores anuales del escenario con su MTB acumulado.
   */
  async listarValoresPorEscenario(escenarioId: number): Promise<ValoresMtbResponseDto> {
    // 1. Verificar que el escenario existe (incluye eliminados para que admin
    //    pueda revisar valores de escenarios eliminados desde auditoría)
    const escenario = await this.escenariosRepo.buscarPorId(escenarioId, true);
    if (!escenario) {
      throw new NotFoundException(`Escenario ${escenarioId} no encontrado`);
    }

    // 2. Cargar valores anuales ordenados ASC
    const valores = await this.valoresRepo.listarPorEscenario(escenarioId);

    // 3. Convertir mtb (string en BD) a number y mantener IDs
    const valoresNumericos = valores.map((v) => ({
      id: v.id,
      anio: v.anio,
      mtb: parseFloat(v.mtb),
    }));

    // 4. Calcular MTB acumulado con el helper
    const valoresConAcumulado = calcularMtbAcumulado(valoresNumericos);

    // 5. Construir response (mantenemos los IDs originales)
    const valoresResponse: ValorMtbDto[] = valoresConAcumulado.map((v, i) => ({
      id: valoresNumericos[i].id,
      anio: v.anio,
      mtb: v.mtb,
      mtbAcumulado: v.mtbAcumulado,
    }));

    const mtbAcumuladoTotal =
      valoresResponse.length > 0
        ? valoresResponse[valoresResponse.length - 1].mtbAcumulado
        : 0;

    return {
      escenarioId: escenario.id,
      escenarioNombre: escenario.nombre,
      valores: valoresResponse,
      totalAnios: valoresResponse.length,
      mtbAcumuladoTotal,
    };
  }

  // ----------------------------------------------------------
  // GUARDAR CAMBIOS (UPSERT + DELETE)
  // ----------------------------------------------------------

  async guardarCambios(
    escenarioId: number,
    dto: GuardarValoresMtbDto,
    user: AuthenticatedUser,
  ): Promise<GuardarValoresMtbResponseDto> {
    // 1. Verificar que el escenario existe y NO está eliminado
    //    (no permitimos cargar valores en escenarios eliminados)
    const escenario = await this.escenariosRepo.buscarPorId(escenarioId);
    if (!escenario) {
      throw new NotFoundException(
        `Escenario ${escenarioId} no encontrado o eliminado`,
      );
    }

    let valoresCreados = 0;
    let valoresActualizados = 0;
    let valoresEliminados = 0;

    // 2. Procesar cambios en transacción
    await this.dataSource.transaction(async (manager) => {
      for (const cambio of dto.cambios) {
        if (cambio.mtb === null) {
          // DELETE
          const eliminado = await this.valoresRepo.eliminarPorAnioEnTransaccion(
            manager,
            escenarioId,
            cambio.anio,
          );
          if (eliminado) valoresEliminados++;
        } else {
          // UPSERT
          const mtbString = cambio.mtb.toFixed(3);
          const { creado } = await this.valoresRepo.upsertEnTransaccion(
            manager,
            escenarioId,
            cambio.anio,
            mtbString,
          );
          if (creado) valoresCreados++;
          else valoresActualizados++;
        }
      }
    });

    // 3. Auditoría: 1 log BULK_LOAD asociado al escenario padre
    await registrarAuditoria(this.auditoria, {
      modulo: ModuloAuditoria.DESGASTE,
      entidad: this.NOMBRE_ENTIDAD_PADRE,
      entidadId: String(escenarioId),
      operacion: OperacionAuditoria.BULK_LOAD,
      user,
      registrosAfectados: dto.cambios.length,
      detalle: {
        escenarioNombre: escenario.nombre,
        valoresCreados,
        valoresActualizados,
        valoresEliminados,
      },
    });

    return {
      cambiosProcesados: dto.cambios.length,
      valoresCreados,
      valoresActualizados,
      valoresEliminados,
      fechaProceso: new Date(),
    };
  }
}