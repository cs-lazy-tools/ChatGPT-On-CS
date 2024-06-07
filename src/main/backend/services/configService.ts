import { ConfigController } from '../controllers/configController';
import { Config } from '../entities/config';
import { CTX_APP_ID, CTX_INSTANCE_ID } from '../constants';

export class ConfigService {
  private configController: ConfigController;

  constructor(configController: ConfigController) {
    this.configController = configController;
  }

  public async get(ctx: any): Promise<Config> {
    const appId = ctx.get(CTX_APP_ID);
    const instanceId = ctx.get(CTX_INSTANCE_ID);

    const instanceConfig =
      await this.configController.getByInstanceId(instanceId);
    if (instanceConfig) {
      return instanceConfig;
    }

    const config = await this.configController.getByAppId(appId);
    if (config) {
      return config;
    }

    return this.configController.getGlobalConfig();
  }
}
