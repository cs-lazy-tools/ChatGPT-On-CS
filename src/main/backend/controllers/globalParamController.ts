import { GlobalParam } from '../entities/globalParam';

export class GlobalParamController {
  async create(globalParamData: any) {
    return GlobalParam.create(globalParamData);
  }

  async update(id: number, globalParamData: any) {
    const globalParam = await GlobalParam.findByPk(id);
    if (!globalParam) {
      throw new Error('GlobalParam not found');
    }
    return globalParam.update(globalParamData);
  }

  async delete(id: number) {
    const globalParam = await GlobalParam.findByPk(id);
    if (!globalParam) {
      throw new Error('GlobalParam not found');
    }
    return globalParam.destroy();
  }

  async list() {
    return GlobalParam.findAll();
  }
}
