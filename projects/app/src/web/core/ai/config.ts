import { GET, PUT, DELETE, POST } from '@/web/common/api/request';
import type { listResponse } from '@/pages/api/core/ai/model/list';
import type { updateBody } from '@/pages/api/core/ai/model/update';
import type { deleteQuery } from '@/pages/api/core/ai/model/delete';
import type { SystemModelItemType } from '@fastgpt/service/core/ai/type';
import type { updateWithJsonBody } from '@/pages/api/core/ai/model/updateWithJson';
import type { updateDefaultBody } from '@/pages/api/core/ai/model/updateDefault';
import type { testQuery } from '@/pages/api/core/ai/model/test';

export const getSystemModelList = () => GET<listResponse>('/core/ai/model/list');
export const getSystemModelDetail = (model: string) =>
  GET<SystemModelItemType>('/core/ai/model/detail', { model });

export const getSystemModelDefaultConfig = (model: string) =>
  GET<SystemModelItemType>('/core/ai/model/getDefaultConfig', { model });

export const putSystemModel = (data: updateBody) =>
  POST('/core/ai/model/update', { ...data, _method: 'PUT' });

// export const deleteSystemModel = (data: deleteQuery) => DELETE('/core/ai/model/delete', data);
export const deleteSystemModel = (data: deleteQuery) =>
  POST('/core/ai/model/delete', { ...data, _method: 'DELETE' });

export const getModelConfigJson = () => GET<string>('/core/ai/model/getConfigJson');

export const putUpdateWithJson = (data: updateWithJsonBody) =>
  POST('/core/ai/model/updateWithJson', { ...data, _method: 'PUT' });

export const getTestModel = (data: testQuery) => GET('/core/ai/model/test', data);

export const putUpdateDefaultModels = (data: updateDefaultBody) =>
  POST('/core/ai/model/updateDefault', { ...data, _method: 'PUT' });
