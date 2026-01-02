import { setupApiInstance } from '@src/api/client-extensions';
import { errorResponseHandlerMiddleware } from '@src/api/middlewares/errorHandlerMiddleware';
import { requestHandlerMiddleware } from '@src/api/middlewares/requestHandlerMiddleware';
import { responseHandlerMiddleware } from '@src/api/middlewares/responseHandlerMiddleware';
import Environment from '@src/static/env';
import axios from 'axios';

const applicationApi = axios.create({
  baseURL: Environment.BASE_API_URI,
});

applicationApi.interceptors.request.use(requestHandlerMiddleware);

applicationApi.interceptors.response.use(responseHandlerMiddleware, errorResponseHandlerMiddleware);

const createController = setupApiInstance(applicationApi);

const Contract = createController('Contract', ({ post }) => ({
  Create: (body: _DevEntities.Contract.CreateRequest) => post('Create', body),
  Initiate: (body: _DevEntities.Contract.InitiateRequest) => post<_DevEntities.Contract.InitiateResponse>('Initiate', body),
  Activate: (contractId: number) => post(`Activate/${contractId}`),
}));

const Addendum = createController('RestructurizationAddendum', ({ post }) => ({
  Create: (body: _DevEntities.Addendum.CreateRequest) => post('Create', body),
  Initiate: (body: _DevEntities.Addendum.InitiateRequest) => post<_DevEntities.Addendum.InitiateResponse>('Initiate', body),
}));

const ContractDirect = createController('ContractDirect', ({ post }) => ({
  Contract: (body: _DevEntities.Contract.ContractDirectRequest) => post('ContractDirect', body),
  Restructurization: (body: _DevEntities.Contract.ContractDirectRequest) => post('RestructurizationDirect', body),
}));
export const devAgent = {
  Contract,
  Addendum,
  ContractDirect,
};
