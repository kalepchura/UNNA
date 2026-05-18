export class OpcionWizardDto {
  /** Identificador único para el gráfico (número). */
  id!: number;
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