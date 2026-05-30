export class OpcionWizardDto {
  /**
   * Identificador de la opción.
   * - Pasos 2, 4, 6: number (IDs de BD)
   * - Paso 1: TipoAgrupacionDesgaste (string enum)
   * - Paso 3: TipoViaFiltro (string enum)
   * - Paso 5: PuntoW (string enum)
   */
  id!: number | string;
 
  /** Etiqueta para mostrar en la UI. */
  etiqueta!: string;
}
 
export class WizardFiltrosResponseDto {
  paso!: number;
  nombrePaso!: string;
  opciones!: OpcionWizardDto[];
  multiSelect!: boolean;
  permiteTodos!: boolean;
  totalOpciones!: number;
}
 