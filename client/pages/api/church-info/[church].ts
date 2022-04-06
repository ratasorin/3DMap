import { NextApiRequest, NextApiResponse } from 'next';
import prisma from 'utils/prisma';

export interface ChurchInfo {
  editedBy: string | null;
  churchDescription: string;
  churchName: string;
}

export interface ChurchInfoSuccessResponse {
  error: false;
  churchInfo: ChurchInfo | null;
}

export interface ChurchInfoFailResponse {
  error: true;
  message: string;
}

export type ChurchInfoUpdateResponse =
  | ChurchInfoSuccessResponse
  | ChurchInfoFailResponse;

const infoForChurch = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const churchInfo = JSON.parse(req.body) as ChurchInfo;
    try {
      await prisma.churchInfo.upsert({
        where: {
          churchName: churchInfo.churchName,
        },
        create: {
          churchName: churchInfo.churchName,
          churchDescription: churchInfo.churchDescription,
          editedBy: churchInfo.editedBy || 'ANONIM',
        },
        update: {
          churchDescription: churchInfo.churchDescription,
          editedBy: churchInfo.editedBy || 'ANONIM',
        },
      });
      res.send({
        error: false,
        churchInfo: churchInfo,
      } as ChurchInfoSuccessResponse);
    } catch (e) {
      console.log(e);
      res.send({
        error: true,
        message: 'Ups! Ceva nu a mers, incercati din nou mai tarziu',
      } as ChurchInfoFailResponse);
    }
  } else {
    const churchName = req.query.church as string;
    console.log(churchName);
    try {
      const churchInfo = await prisma.churchInfo.findFirst({
        where: {
          churchName,
        },
      });
      console.log(churchInfo);
      if (churchInfo)
        res.send({
          error: false,
          churchInfo,
        } as ChurchInfoSuccessResponse);
      else
        res.send({
          error: true,
          message: `Se pare ca nimeni nu a mai incarcat o descriere pentru ${churchName}`,
        } as ChurchInfoFailResponse);
    } catch (e) {
      res.send({
        error: true,
        message: 'Ups! Ceva nu a mers, incercati din nou mai tarziu',
      } as ChurchInfoFailResponse);
    }
  }
};

export default infoForChurch;
