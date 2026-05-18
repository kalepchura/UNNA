import { Injectable } from '@nestjs/common';
import {
  EliminadosResumenResponseDto,
  EntidadEliminadosDto,
} from '../dto/eliminados-resumen-response.dto';
import { FallasRielService } from '../../fallas/services/fallas-riel.service';
import { FallasSoldaduraInoxService } from '../../fallas/services/fallas-soldadura-inox.service';
import { TemperaturaImportacionService } from '../../temperatura/services/temperatura-importacion.service';
import { EscenariosMtbService } from '../../desgaste/services/escenarios-mtb.service';

@Injectable()
export class EliminadosResumenService {
  constructor(
    private readonly fallasRielService: FallasRielService,
    private readonly fallasSoldService: FallasSoldaduraInoxService,
    private readonly temperaturaService: TemperaturaImportacionService,
    private readonly escenariosService: EscenariosMtbService,
  ) {}

  async obtenerResumen(): Promise<EliminadosResumenResponseDto> {
    const [totalRiel, totalSold, totalTempImp, totalEscenarios] = await Promise.all([
      this.fallasRielService.contarEliminados(),
      this.fallasSoldService.contarEliminados(),
      this.temperaturaService.contarEliminadas(),
      this.escenariosService.contarEliminados(),
    ]);

    const entidades: EntidadEliminadosDto[] = [
      {
        codigo: 'fallas-riel',
        nombre: 'Fallas en Riel',
        modulo: 'FALLAS',
        total: totalRiel,
      },
      {
        codigo: 'fallas-soldadura-inox',
        nombre: 'Fallas en Soldaduras (Cambiavía)',
        modulo: 'FALLAS',
        total: totalSold,
      },
      {
        codigo: 'temperatura-importaciones',
        nombre: 'Importaciones de Temperatura',
        modulo: 'TEMPERATURA',
        total: totalTempImp,
      },
      {
        codigo: 'desgaste-escenarios-mtb',
        nombre: 'Escenarios MTB de Desgaste',
        modulo: 'DESGASTE',
        total: totalEscenarios,
      },
    ];

    const totalGeneral = entidades.reduce((acc, e) => acc + e.total, 0);

    return {
      entidades,
      totalGeneral,
      calculadoEn: new Date(),
    };
  }
}