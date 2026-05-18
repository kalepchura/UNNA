import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entidades
import { TemperaturaImportacion } from './entities/temperatura-importacion.entity';
import { Temperatura } from './entities/temperatura.entity';

// Parsers
import { CsvTemperaturaParser } from './parsers/csv-temperatura.parser';
import { ExcelTemperaturaParser } from './parsers/excel-temperatura.parser';
import { XmlTemperaturaParser } from './parsers/xml-temperatura.parser';
import { TemperaturaParserFactory } from './parsers/temperatura-parser.factory';
import {
  PARSER_CSV,
  PARSER_EXCEL,
  PARSER_XML,
} from './parsers/parser.tokens';

// Repositories
import { TemperaturaImportacionRepository } from './repositories/temperatura-importacion.repository';
import { TemperaturaRepository } from './repositories/temperatura.repository';

// Services
import { TemperaturaImportacionService } from './services/temperatura-importacion.service';

// Controllers
import { TemperaturaImportacionController } from './controllers/temperatura-importacion.controller';

// Catálogos necesarios
import { TramosModule } from '../catalogos/tramos/tramos.module';

import { TemperaturaConsultaService } from './services/temperatura-consulta.service';
import { TemperaturaConsultaController } from './controllers/temperatura-consulta.controller';

import { TemperaturaAnalyticsRepository } from './repositories/temperatura-analytics.repository';
import { KpisTemperaturaService } from './services/kpis-temperatura.service';
import { TemperaturaAnalyticsController } from './controllers/temperatura-analytics.controller';
import { GraficoG1TempService } from './services/grafico-g1-temp.service';
import { GraficoG2TempService } from './services/grafico-g2-temp.service';
import { GraficoG3TempService } from './services/grafico-g3-temp.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TemperaturaImportacion, Temperatura]),
    TramosModule,
  ],
  controllers: [TemperaturaImportacionController, TemperaturaConsultaController, TemperaturaAnalyticsController, ],
  providers: [
    // Parsers
    CsvTemperaturaParser,
    ExcelTemperaturaParser,
    XmlTemperaturaParser,
    { provide: PARSER_CSV, useExisting: CsvTemperaturaParser },
    { provide: PARSER_EXCEL, useExisting: ExcelTemperaturaParser },
    { provide: PARSER_XML, useExisting: XmlTemperaturaParser },
    TemperaturaParserFactory,

    // Repositories
    TemperaturaImportacionRepository,
    TemperaturaRepository,
     TemperaturaAnalyticsRepository,

    // Services
    TemperaturaImportacionService,
    
    TemperaturaConsultaService,
    KpisTemperaturaService, 
    GraficoG1TempService,
    GraficoG2TempService,
    GraficoG3TempService,

  ],
  exports: [
    TemperaturaParserFactory,
    TemperaturaImportacionService,
    TemperaturaConsultaService,
    TemperaturaImportacionRepository,
    TemperaturaRepository,
    
  ],
})
export class TemperaturaModule {}