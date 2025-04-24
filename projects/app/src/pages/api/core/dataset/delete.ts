import type { NextApiRequest } from 'next';
import { authDataset } from '@fastgpt/service/support/permission/dataset/auth';
import { delDatasetRelevantData } from '@fastgpt/service/core/dataset/controller';
import { findDatasetAndAllChildren } from '@fastgpt/service/core/dataset/controller';
import { MongoDataset } from '@fastgpt/service/core/dataset/schema';
import { mongoSessionRun } from '@fastgpt/service/common/mongo/sessionRun';
import { NextAPI } from '@/service/middleware/entry';
import { OwnerPermissionVal } from '@fastgpt/global/support/permission/constant';
import { CommonErrEnum } from '@fastgpt/global/common/error/code/common';
import { MongoDatasetCollectionTags } from '@fastgpt/service/core/dataset/tag/schema';
import { removeImageByPath } from '@fastgpt/service/common/file/image/controller';
import { DatasetTypeEnum } from '@fastgpt/global/core/dataset/constants';
import { removeWebsiteSyncJobScheduler } from '@fastgpt/service/core/dataset/websiteSync';

async function handler(req: NextApiRequest) {
  // 支持 POST 请求获取 id
  const id = req.method === 'POST' ? req.body.id : req.query.id;

  if (!id) {
    return Promise.reject(CommonErrEnum.missingParams);
  }

  // auth owner
  const { teamId } = await authDataset({
    req,
    authToken: true,
    authApiKey: true,
    datasetId: id,
    per: OwnerPermissionVal
  });

  const datasets = await findDatasetAndAllChildren({
    teamId,
    datasetId: id
  });
  const datasetIds = datasets.map((d) => d._id);

  // delete collection.tags
  await MongoDatasetCollectionTags.deleteMany({
    teamId,
    datasetId: { $in: datasetIds }
  });

  await Promise.all(
    datasets.map((dataset) => {
      if (dataset.type === DatasetTypeEnum.websiteDataset)
        return removeWebsiteSyncJobScheduler(String(dataset._id));
    })
  );

  // delete all dataset.data and pg data
  await mongoSessionRun(async (session) => {
    // delete dataset data
    await delDatasetRelevantData({ datasets, session });

    // delete dataset
    await MongoDataset.deleteMany(
      {
        _id: { $in: datasetIds }
      },
      { session }
    );

    for await (const dataset of datasets) {
      await removeImageByPath(dataset.avatar, session);
    }
  });
}

export default NextAPI(handler);
