import { ConfigService as NestConfigService } from '@nestjs/config';

type ConfigService = NestConfigService<ImportMetaEnv>;

export { NestConfigService as ConfigServiceClass };
export default ConfigService;
