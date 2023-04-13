import autobind from 'autobind-decorator';
import axios, { AxiosResponse } from 'axios';
import config from 'config';
import { Response } from 'express';
import { v4 as uuid } from 'uuid';

import { CaseDate } from '../../../app/case/case';
import { AppRequest } from '../../../app/controller/AppRequest';
import { CHECK_YOUR_ANSWERS } from '../../urls';

import { createToken } from './createToken';

@autobind
export default class PCQGetController {
  public async get(req: AppRequest, res: Response): Promise<void> {
    const pcqUrl: string = config.get('services.equalityAndDiversity.url');
    const pcqEnabled: boolean = JSON.parse(config.get('services.equalityAndDiversity.enabled'));
    if (pcqEnabled && !req.session.userCase.pcqId) {
      const response: AxiosResponse<StatusResponse> = await axios.get(pcqUrl + '/health');
      const equalityHealth = response.data && response.data.status === 'UP';
      if (equalityHealth) {
        req.session.userCase.pcqId = uuid();
        const pcqParams = this.gatherPcqParams(req);
        const path: string = config.get('services.equalityAndDiversity.path');
        const qs = Object.keys(pcqParams)
          .map(key => `${key}=${pcqParams[key]}`)
          .join('&');
        res.redirect(`${pcqUrl}${path}?${qs}`);
      } else {
        res.redirect(CHECK_YOUR_ANSWERS);
      }
    } else {
      res.redirect(CHECK_YOUR_ANSWERS);
    }
  }

  private gatherPcqParams(req: AppRequest) {
    const developmentMode = process.env.NODE_ENV === 'development';
    const protocol = developmentMode ? 'http://' : '';
    const host = req.headers['x-forwarded-host'] || req.hostname;
    const port = developmentMode ? `:${config.get('port')}` : '';
    const pcqParams = {
      actor: 'APPLICANT',
      serviceId: 'SpecialTribunals_CIC',
      ccdCaseId: req.session.userCase.id,
      pcqId: req.session.userCase.pcqId,
      partyId: req.session.userCase.subjectEmailAddress,
      language: req.session.lang ? req.session.lang : 'en',
      returnUrl: `${protocol}${host}${port}${CHECK_YOUR_ANSWERS}`,
      ageCheck: this.calculateAgeCheckParam(req.session.userCase.subjectDateOfBirth).toString(),
    };
    const tokenKey: string = config.get('services.equalityAndDiversity.tokenKey');
    pcqParams['token'] = createToken(pcqParams, tokenKey);
    pcqParams.partyId = encodeURIComponent(pcqParams.partyId);
    return pcqParams;
  }

  private calculateAgeCheckParam(dateOfBirth: CaseDate) {
    const dobPlus18 = new Date(Number(dateOfBirth.year) + 18, Number(dateOfBirth.month), Number(dateOfBirth.day));
    const dobPlus16 = new Date(Number(dateOfBirth.year) + 16, Number(dateOfBirth.month), Number(dateOfBirth.day));
    const today = new Date();
    if (today.getTime() >= dobPlus18.getTime()) {
      return 2;
    } else if (today.getTime() >= dobPlus16.getTime()) {
      return 1;
    } else {
      return 0;
    }
  }
}

export interface StatusResponse {
  status: 'UP' | 'DOWN' | undefined;
}
