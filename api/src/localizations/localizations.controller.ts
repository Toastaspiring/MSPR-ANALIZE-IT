import { Controller, Get } from '@nestjs/common';
import { LocalizationService } from './localizations.service';

@Controller('localization')
export class LocalizationController {
    constructor(
        private localizationService: LocalizationService,
    ){}
}
