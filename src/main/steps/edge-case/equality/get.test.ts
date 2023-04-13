import axios from 'axios';
import config from 'config';

import { mockRequest } from '../../../../test/unit/utils/mockRequest';
import { mockResponse } from '../../../../test/unit/utils/mockResponse';
import { CHECK_YOUR_ANSWERS } from '../../urls';

import PCQGetController from './get';

jest.mock('axios');
jest.mock('config');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedConfig = config as jest.Mocked<typeof config>;

describe('PCQGetController', () => {
  const controller = new PCQGetController();

  test('Should redirect to PCQ', async () => {
    mockedConfig.get.mockReturnValueOnce('https://pcq.aat.platform.hmcts.net');
    mockedConfig.get.mockReturnValueOnce('true');
    mockedConfig.get.mockReturnValueOnce('SERVICE_TOKEN_KEY');
    mockedConfig.get.mockReturnValueOnce('/service-endpoint');

    const req = mockRequest();
    const res = mockResponse();
    req.session.userCase.subjectDateOfBirth = { day: '01', month: '01', year: '1970' };

    const redirectMock = jest.fn();
    res.redirect = redirectMock;

    mockedAxios.get.mockResolvedValue({
      data: {
        status: 'UP',
      },
    });

    await controller.get(req, res);
    expect(redirectMock.mock.calls[0][0]).toContain('/service-endpoint');
    expect(redirectMock.mock.calls[0][0]).toContain('ageCheck=2');
  });

  test('Should set ageCheck value to 1', async () => {
    mockedConfig.get.mockReturnValueOnce('https://pcq.aat.platform.hmcts.net');
    mockedConfig.get.mockReturnValueOnce('true');
    mockedConfig.get.mockReturnValueOnce('SERVICE_TOKEN_KEY');
    mockedConfig.get.mockReturnValueOnce('/service-endpoint');

    const req = mockRequest();
    const res = mockResponse();
    const today = new Date();
    req.session.userCase.subjectDateOfBirth = {
      day: today.getDay().toString(),
      month: today.getMonth().toString(),
      year: (today.getFullYear() - 16).toString(),
    };

    const redirectMock = jest.fn();
    res.redirect = redirectMock;

    mockedAxios.get.mockResolvedValue({
      data: {
        status: 'UP',
      },
    });

    await controller.get(req, res);
    expect(redirectMock.mock.calls[0][0]).toContain('ageCheck=1');
  });

  test('Should set ageCheck value to 0', async () => {
    mockedConfig.get.mockReturnValueOnce('https://pcq.aat.platform.hmcts.net');
    mockedConfig.get.mockReturnValueOnce('true');
    mockedConfig.get.mockReturnValueOnce('SERVICE_TOKEN_KEY');
    mockedConfig.get.mockReturnValueOnce('/service-endpoint');

    const req = mockRequest();
    const res = mockResponse();
    const today = new Date();
    req.session.userCase.subjectDateOfBirth = {
      day: today.getDay().toString(),
      month: today.getMonth().toString(),
      year: (today.getFullYear() - 1).toString(),
    };

    const redirectMock = jest.fn();
    res.redirect = redirectMock;

    mockedAxios.get.mockResolvedValue({
      data: {
        status: 'UP',
      },
    });

    await controller.get(req, res);
    expect(redirectMock.mock.calls[0][0]).toContain('ageCheck=0');
  });

  test('Should redirect to Check Your Answers if PCQ Health is DOWN', async () => {
    const req = mockRequest();
    const res = mockResponse();

    mockedAxios.get.mockResolvedValue(
      Promise.resolve({
        data: {
          status: 'DOWN',
        },
      })
    );

    await controller.get(req, res);

    expect(res.redirect).toHaveBeenCalledWith(CHECK_YOUR_ANSWERS);
  });

  test('Should redirect to Check Your Answers if pcqId is already populated', async () => {
    const req = mockRequest();
    const res = mockResponse();
    req.session.userCase.pcqId = '1234';

    await controller.get(req, res);

    expect(res.redirect).toHaveBeenCalledWith(CHECK_YOUR_ANSWERS);
  });

  test('Should redirect to Check Your Answers if PCQ is disabled', async () => {
    mockedConfig.get.mockReturnValueOnce('https://pcq.aat.platform.hmcts.net');
    mockedConfig.get.mockReturnValueOnce('false');

    const req = mockRequest();
    const res = mockResponse();

    await controller.get(req, res);

    expect(res.redirect).toHaveBeenCalledWith(CHECK_YOUR_ANSWERS);
  });
});
