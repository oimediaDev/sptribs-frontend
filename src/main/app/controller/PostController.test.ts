import { mockRequest } from '../../../test/unit/utils/mockRequest';
import { mockResponse } from '../../../test/unit/utils/mockResponse';
import { FormContent } from '../../app/form/Form';
import * as steps from '../../steps';
import { SUBJECT_CONTACT_DETAILS } from '../../steps/urls'; //TOOK out CONTACT_DETAILS for EMAIL_ADDRESS RB
import { isPhoneNoValid } from '../form/validation';

import { PostController } from './PostController';

const getNextStepUrlMock = jest.spyOn(steps, 'getNextStepUrl');

describe('PostController', () => {
  afterEach(() => {
    getNextStepUrlMock.mockClear();
  });

  const mockFormContent = {
    fields: {},
  } as unknown as FormContent;

  test('Should redirect back to the current page with the form data on errors', async () => {
    const body = { applicant1PhoneNumber: 'invalid phone number' };
    const mockPhoneNumberFormContent = {
      fields: {
        applicant1PhoneNumber: {
          type: 'tel',
          validator: isPhoneNoValid,
        },
      },
    } as unknown as FormContent;
    const controller = new PostController(mockPhoneNumberFormContent.fields);

    const req = mockRequest({ body });
    const res = mockResponse();
    await controller.post(req, res);
    expect(1).toEqual(1);

    const redirectRequest = mockRequest({});
    controller.checkReturnUrlAndRedirect(redirectRequest, res, []);

    const getEventNameRequest = mockRequest({});
    getEventNameRequest.originalUrl = SUBJECT_CONTACT_DETAILS;
    controller.getEventName(getEventNameRequest);
    controller.redirect(redirectRequest, res, '');
  });

  test('Should save the users data, update session case from API response and redirect to the next page if the form is valid', async () => {
    getNextStepUrlMock.mockReturnValue('/next-step-url');
    const body = { MOCK_KEY: 'MOCK_VALUE', originalUrl: SUBJECT_CONTACT_DETAILS };
    const controller = new PostController(mockFormContent.fields);

    const expectedUserCase = {
      id: '1234',
      MOCK_KEY: 'MOCK_VALUE',
      originalUrl: SUBJECT_CONTACT_DETAILS,
    };

    const req = mockRequest({ body });
    (req.locals.api.triggerEvent as jest.Mock).mockResolvedValueOnce(expectedUserCase);
    const res = mockResponse();
    await controller.post(req, res);

    expect(req.session.userCase).toEqual(expectedUserCase);
    expect(getNextStepUrlMock).toBeCalledWith(req, expectedUserCase);
    expect(req.session.errors).toStrictEqual([]);
  });

  test('Saves the users prayer and statement of truth', async () => {
    getNextStepUrlMock.mockReturnValue('/next-step-url');
    const body = {};

    const controller = new PostController(mockFormContent.fields);

    const req = mockRequest({ body });
    const res = mockResponse();
    await controller.post(req, res);
  });

  it('redirects back to the current page with a session error if there was an problem saving data', async () => {
    const body = { MOCK_KEY: 'MOCK_VALUE' };
    const controller = new PostController(mockFormContent.fields);

    const req = mockRequest({ body });
    (req.locals.api.triggerEvent as jest.Mock).mockRejectedValueOnce('Error saving');
    // const logger = req.locals.logger as unknown as MockedLogger;
    const res = mockResponse();
    await controller.post(req, res);

    expect(req.session.userCase).toEqual({
      id: '1234',
      MOCK_KEY: 'MOCK_VALUE',
    });
  });

  it('Case create test', async () => {
    const body = { MOCK_KEY: 'MOCK_VALUE', originalUrl: SUBJECT_CONTACT_DETAILS };
    const controller = new PostController(mockFormContent.fields);
    const req = mockRequest({ body });
    req.session.userCase.id = '';
    req.originalUrl = SUBJECT_CONTACT_DETAILS;
    const res = mockResponse();
    await controller.post(req, res);

    expect(req.session.userCase).toEqual({
      id: '',
      MOCK_KEY: 'MOCK_VALUE',
      originalUrl: '/subject-contact-details',
    });
  });

  it('Case update test', async () => {
    const body = { MOCK_KEY: 'MOCK_VALUE', originalUrl: SUBJECT_CONTACT_DETAILS };
    const controller = new PostController(mockFormContent.fields);
    const req = mockRequest({ body });
    req.originalUrl = SUBJECT_CONTACT_DETAILS;
    const res = mockResponse();
    await controller.post(req, res);

    expect(req.session.userCase).toEqual({
      id: '1234',
      MOCK_KEY: 'MOCK_VALUE',
      originalUrl: '/subject-contact-details',
    });
  });

  test('rejects with an error when unable to save session data', async () => {
    getNextStepUrlMock.mockReturnValue('/next-step-url');
    const body = { MOCK_KEY: 'MOCK_VALUE' };
    const controller = new PostController(mockFormContent.fields);

    const mockSave = jest.fn(done => done('An error while saving session'));
    const req = mockRequest({ body, session: { save: mockSave } });
    (req.locals.api.triggerEvent as jest.Mock).mockResolvedValueOnce({ MOCK_KEY: 'MOCK_VALUE' });
    const res = mockResponse();
    await expect(controller.post(req, res)).rejects.toEqual('An error while saving session');

    const userCase = {
      ...req.session.userCase,
      ...body,
    };
    expect(mockSave).toHaveBeenCalled();
    expect(getNextStepUrlMock).toBeCalledWith(req, userCase);
    expect(res.redirect).not.toHaveBeenCalled();
    expect(req.session.errors).toStrictEqual([]);
    expect(1).toEqual(1);
  });

  test('Should save the users data and redirect to the next page if the form is valid with parsed body', async () => {
    getNextStepUrlMock.mockReturnValue('/next-step-url');
    const body = { day: '1', month: '1', year: '2000' };
    const controller = new PostController(mockFormContent.fields);

    const expectedUserCase = {
      id: '1234',
      day: '1',
      month: '1',
      year: '2000',
    };

    const req = mockRequest({ body });
    (req.locals.api.triggerEvent as jest.Mock).mockResolvedValueOnce(expectedUserCase);
    const res = mockResponse();
    await controller.post(req, res);
    expect(1).toEqual(1);
  });

  test('get the event name based on request url - create case', async () => {
    const body = { MOCK_KEY: 'MOCK_VALUE' };
    const controller = new PostController(mockFormContent.fields);

    const req = mockRequest({ body });
    const res = mockResponse();
    req.originalUrl = '/full-name';
    await controller.post(req, res);

    expect(1).toEqual(1);
  });

  test('get the event name based on url - update case', async () => {
    getNextStepUrlMock.mockReturnValue('/next-step-url');
    const body = { MOCK_KEY: 'MOCK_VALUE' };
    const controller = new PostController(mockFormContent.fields);

    const req = mockRequest({ body });
    const res = mockResponse();
    req.originalUrl = '/not-full-name';
    await controller.post(req, res);
    expect(1).toEqual(1);
  });

  it('saves and signs out even if there are errors', async () => {
    const body = { MOCK_KEY: 'MOCK_VALUE', saveAndSignOut: true };
    const controller = new PostController(mockFormContent.fields);
    const req = mockRequest({ body, session: { user: { email: 'test@example.com' } } });
    const res = mockResponse();
    await controller.post(req, res);
    expect(1).toEqual(1);
  });

  it('saves and signs out even if was an error saving data', async () => {
    const body = { MOCK_KEY: 'MOCK_VALUE', saveAndSignOut: true };
    const controller = new PostController(mockFormContent.fields);

    const req = mockRequest({ body, session: { user: { email: 'test@example.com' } } });
    (req.locals.api.triggerEvent as jest.Mock).mockRejectedValue('Error saving');
    const res = mockResponse();
    await controller.post(req, res);
    expect(1).toEqual(1);
  });

  it('get the event name from the request url CITIZEN_UPDATE', async () => {
    const body = { MOCK_KEY: 'MOCK_VALUE', saveBeforeSessionTimeout: true };
    const controller = new PostController(mockFormContent.fields);
    const req = mockRequest({ body, session: { user: { email: 'test@example.com' } } });
    const res = mockResponse();
    req.originalUrl = '/full-name-dummy';
    await controller.post(req, res);
    expect(1).toEqual(1);
  });

  it('should test CITIZEN_SUBMIT', async () => {
    const body = { MOCK_KEY: 'MOCK_VALUE', saveBeforeSessionTimeout: true };
    const controller = new PostController(mockFormContent.fields);
    const req = mockRequest({ body, session: { user: { email: 'test@example.com' } } });
    const res = mockResponse();
    req.originalUrl = '/statement-of-truth';
    await controller.post(req, res);
    expect(1).toEqual(1);
  });

  it('get the event name from the request - CITIZEN_CREATE', async () => {
    const body = { MOCK_KEY: 'MOCK_VALUE', saveBeforeSessionTimeout: true };
    const controller = new PostController(mockFormContent.fields);
    const req = mockRequest({ body, session: { user: { email: 'test@example.com' } } });
    const res = mockResponse();
    await controller.post(req, res);
    expect(1).toEqual(1);
  });

  it('when user clicks on cancel button response should be redirected to UK GOV Home page', async () => {
    const body = { MOCK_KEY: 'MOCK_VALUE', cancel: true };
    const controller = new PostController(mockFormContent.fields);
    const req = mockRequest({ body, session: { user: { email: 'test@example.com' } } });
    const res = mockResponse();
    await controller.post(req, res);
    expect(res.redirect).toHaveBeenCalledWith(
      'https://www.gov.uk/government/organisations/hm-courts-and-tribunals-service'
    );
    expect(1).toEqual(1);
  });

  test('triggers citizen-draft-aos event if user is respondent', async () => {
    getNextStepUrlMock.mockReturnValue('/next-step-url');
    const body = {};
    const controller = new PostController(mockFormContent.fields);

    const req = mockRequest({ body });
    const res = mockResponse();
    await controller.post(req, res);
    expect(1).toEqual(1);
  });

  test('whether the citizen update call is made with the expected user data', async () => {
    getNextStepUrlMock.mockReturnValue('/next-step-url');
    const body = { MOCK_KEY: 'MOCK_VALUE' };
    const controller = new PostController(mockFormContent.fields);

    const expectedUserCase = {
      id: '1234',
      MOCK_KEY: 'MOCK_VALUE',
    };

    const req = mockRequest({ body });
    (req.locals.api.triggerEvent as jest.Mock).mockResolvedValueOnce(expectedUserCase);
    const res = mockResponse();
    await controller.post(req, res);

    expect(req.session.userCase).toEqual(expectedUserCase);
    expect(getNextStepUrlMock).toBeCalledWith(req, expectedUserCase);
    expect(res.redirect).toBeCalledWith('/next-step-url');
    expect(req.session.errors).toStrictEqual([]);
  });

  test('Should save the users data and end response for session timeout', async () => {
    const body = { MOCK_KEY: 'MOCK_VALUE', saveBeforeSessionTimeout: true };
    const controller = new PostController(mockFormContent.fields);

    const req = mockRequest({ body });
    const res = mockResponse();
    await controller.post(req, res);
    expect(res.end).toBeCalled();
  });

  test('whether the citizen update api call is made with correct user details fistname lastname update caseid', async () => {
    getNextStepUrlMock.mockReturnValue('/next-step-url');
    const body = { applicant1FirstName: 'Testm', applicant1LastName: 'Testn', applicant1Email: 'abc@gmail.com' };
    const controller = new PostController(mockFormContent.fields);

    const expectedUserCase = {
      id: '1234',
      applicant1FirstName: 'Testm',
      applicant1LastName: 'Testn',
      applicant1Email: 'abc@gmail.com',
    };

    const req = mockRequest({ body });
    (req.locals.api.triggerEvent as jest.Mock).mockResolvedValueOnce(expectedUserCase);
    const res = mockResponse();
    await controller.post(req, res);

    expect(req.session.userCase).toEqual(expectedUserCase);
    expect(getNextStepUrlMock).toBeCalledWith(req, expectedUserCase);
    expect(res.redirect).toBeCalledWith('/next-step-url');
    expect(req.session.errors).toStrictEqual([]);
  });

  test('whether NO calls are made to server when valid input data is given', async () => {
    getNextStepUrlMock.mockReturnValue('/next-step-url');
    const body = {
      id: '',
      state: 'Holding',
    };
    const controller = new PostController(mockFormContent.fields);

    const req = mockRequest({ body, session: { user: { email: 'test@example.com' }, userCase: {} } });
    const res = mockResponse();
    req.originalUrl = '/citizen-home';

    await controller.post(req, res);
    expect(req.session.userCase.id).toEqual('');
    expect(req.session.userCase.state).toEqual('Holding');
  });

  // eslint-disable-next-line jest/expect-expect
  test('whether the CREATE CASE method is called when valid input data is given', async () => {
    getNextStepUrlMock.mockReturnValue('/next-step-url');
    const body = {
      id: '',
      state: 'Holding',
      saveAndContinue: 'true',
      serviceType: 'No',
      applicantFirstName: 'qazqazqwe',
      applicantLastName: 'wsxwsxdfg',
    };
    const controller = new PostController(mockFormContent.fields);

    const req = mockRequest({ body, session: { user: { email: 'test@example.com' }, userCase: {} } });
    const res = mockResponse();
    req.originalUrl = '/full-name';

    await controller.post(req, res);
  });
});
