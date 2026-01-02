import axios from 'axios';
import Environment from '@src/static/env';
import { queryParams } from '@src/utils/url';
import { Unit } from '@src/types/models/unit';
import { requestHandlerMiddleware } from './middlewares/requestHandlerMiddleware';
import { responseHandlerMiddleware } from './middlewares/responseHandlerMiddleware';
import { errorResponseHandlerMiddleware } from './middlewares/errorHandlerMiddleware';
import { setupApiInstance } from './client-extensions';
import QuerySpecification from '@src/lib/data-management/utility/query-specification';

const applicationApi = axios.create({
  baseURL: Environment.BASE_API_URI,
});

applicationApi.interceptors.request.use(requestHandlerMiddleware);

applicationApi.interceptors.response.use(responseHandlerMiddleware, errorResponseHandlerMiddleware);

const createController = setupApiInstance(applicationApi);

const EntityOptions = createController('EntityOptions', ({ get }) => ({
  Companies: () => get<Array<Models.EntityOptions>>('Companies'),
  ProductReleases: () => get<Array<Models.EntityOptions>>('ProductReleases'),
  ProductConditions: () => get<Array<Models.EntityOptions>>('ProductConditions'),
  ProductConditionsForRelease: (ProductChannelId: number) =>
    get<Array<Models.EntityOptions>>(`ProductConditionsForRelease/${ProductChannelId}`),
  ProductConfigurations: () => get<Array<Models.EntityOptions>>('ProductConfigurations'),
  ProductConfigurationsForRelease: (ProductChannelId: number) =>
    get<Array<Models.EntityOptions>>(`ProductConfigurationsForRelease/${ProductChannelId}`),
  ProductChannels: () => get<Array<Models.EntityOptions>>('ProductChannels'),
  ProductChannelsForConfiguration: (CompanyId: number) => get<Array<Models.EntityOptions>>(`ProductChannelsForConfiguration/${CompanyId}`),
  ProductChannelsForRelease: () => get<Array<Models.EntityOptions>>('ProductChannelsForRelease'),
  ProductChannelsForCondition: () => get<Array<Models.EntityOptions>>(`ProductChannelsForCondition`),
  RemoteBanks: (searchQuery: string) => get<Array<Models.EntityOptions>>('RemoteBanks' + queryParams({ searchQuery })),
}));

const Company = createController('Company', ({ get, post }) => ({
  List: (filter?: QuerySpecification) => post<PagedResult<Models.Company.Item>>('List', filter),
  Details: (id: number) => get<Models.Company.Item>(`Details/${id}`),
  Create: (body: Models.Company.Create) => post('Create', body),
  Update: (body: Models.Company.Update) => post('Update', body),
  Remove: (id: number) => post<Unit>(`Remove/${id}`),
}));

const ContractItem = createController('Contract', ({ get, post }) => ({
  List: (filter?: QuerySpecification) => post<PagedResult<Models.ContractItem.ViewModel>>('List', filter),
  Details: (id: number) => get<Models.ContractItem.Item>(`Details/${id}`),
  TerminationDetails: (query: Models.ContractItem.TerminationDetailsRequest) =>
    post<Models.ContractItem.TerminationDetailsResponse>(`TerminationDetails`, query),
  Terminate: (body: Models.ContractItem.TerminateRequest) => post<{ document: string }>('Terminate', body),
  Remove: (id: number) => post<Unit>(`Remove/${id}`),
  Cancel: (id: number) => post<Unit>(`Cancel/${id}`),
  Sign: (id: number) => post<Unit>(`Sign/${id}`),
}));

const ContractDocument = createController('ContractDocument', ({ get, post }) => ({
  List: (contractId: number) => get<Array<Models.ContractDocument.Item>>(`List/${contractId}`),
  Remove: (contractId: number) => post<Unit>(`Remove/${contractId}`),
  Download: (contractId: number) => get<string>(`Download/${contractId}`),
  Upload: (body: Models.ContractDocument.Create) => post<Models.ContractDocument.Item>('Upload', body),
}));

const Identity = createController('Identity', ({ get, post }) => ({
  AuthenticateSSO: (token: string) => post<Models.Identity.AuthenticateSSOResponse>('AuthenticateSSO', { token }),
  AddAccessToUser: (body: Models.AppAccess.AlterUserAccess) => post('AddAccessToUser', body),
  RemoveAccessFromUser: (body: Models.AppAccess.AlterUserAccess) => post('RemoveAccessFromUser', body),
  ListUsersNotInUse: (filter?: QuerySpecification) => post<PagedResult<Models.RemoteEmployee.Item>>('ListUsersNotInUse', filter),
  ListUsersInUse: (filter?: QuerySpecification) => post<PagedResult<Models.RemoteEmployee.DetailedItem>>('ListUsersInUse', filter),
  ListUserAccesses: (email: string) => get<Array<Models.AppAccess.Item>>('ListUserAccesses' + queryParams({ email })),
  ListAccesses: () => get<Array<Models.AppAccess.Item>>('ListAccesses'),
  CurrentUserInfo: () => get<Models.AppUser.Item>('CurrentUserInfo'),
  AddUser: (email: string) => post('AddUser' + queryParams({ email })),
  AddMultipleUsers: (body: { emails: Array<string> }) => post('AddMultipleUsers', body),
  Remove: (email: string) => post('RemoveUser' + queryParams({ email })),
  Image: (body: Models.Identity.ImageRequest) =>
    applicationApi
      .post<Blob>('Identity/Image', body, {
        responseType: 'blob',
      })
      .then((res) => res.data),
}));

const ProductCondition = createController('ProductCondition', ({ get, post }) => ({
  List: (filter?: QuerySpecification) => post<PagedResult<Models.ProductCondition.Item>>('List', filter),
  Details: (id: number) => get<Models.ProductCondition.Item>(`Details/${id}`),
  DetailsByChannel: (productChannelId: number) => get<Models.ProductCondition.Item>(`DetailsByChannel/${productChannelId}`),
  Create: (body: Models.ProductCondition.Create) => post<Models.ProductCondition.Item>('Create', body),
  Update: (body: Models.ProductCondition.Update) => post<Models.ProductCondition.Item>('Update', body),
  CheckEligibilityForCreate: (productChannelId: number) => get<string>('CheckEligibilityForCreate' + queryParams({ productChannelId })),
  Remove: (id: number) => post(`Remove/${id}`),
}));

const ProductConfiguration = createController('ProductConfiguration', ({ get, post }) => ({
  List: (filter?: QuerySpecification) => post<PagedResult<Models.ProductConfiguration.Item>>('List', filter),
  Details: (id: number) => get<Models.ProductConfiguration.Item>(`Details/${id}`),
  DetailsByChannel: (productChannelId: number) => get<Models.ProductConfiguration.Item>(`DetailsByChannel/${productChannelId}`),
  Create: (body: Models.ProductConfiguration.Create) => post<Models.ProductConfiguration.Item>('Create', body),
  Update: (body: Models.ProductConfiguration.Update) => post<Models.ProductConfiguration.Item>('Update', body),
  CheckEligibilityForCreate: (productChannelId: number, companyId: number) =>
    get<string>('CheckEligibilityForCreate' + queryParams({ productChannelId, companyId })),
  Remove: (id: number) => post(`Remove/${id}`),
}));

const ProductChannel = createController('ProductChannel', ({ get, post }) => ({
  List: (filter?: QuerySpecification) => post<PagedResult<Models.ProductChannel.Item>>('List', filter),
  Details: (id: number) => get<Models.ProductChannel.Item>(`Details/${id}`),
  Create: (body: Models.ProductChannel.Create) => post<Models.ProductChannel.Item>('Create', body),
  Update: (body: Models.ProductChannel.Update) => post<Models.ProductChannel.Item>('Update', body),
  Remove: (id: number) => post<Unit>(`Remove/${id}`),
}));

const ProductCoverage = createController('ProductCoverage', ({ get, post }) => ({
  ListInUse: (filter?: QuerySpecification) => post<PagedResult<Models.ImportedCoverage.Item>>('ListInUse', filter),
  ListInUseByProduct: () => get<Array<Models.ImportedCoverage.Item>>(`ListInUseByProduct`),
  ListNotInUseByProduct: () => get<Array<Models.RemoteCoverage.Item>>(`ListNotInUseByProduct`),
  ListChannelCoverages: (channelId: number, companyId: number, conditionId?: number) =>
    get<Array<Models.ProductCondition.ConditionCoverage>>('ListChannelCoverages' + queryParams({ channelId, companyId, conditionId })),
  ImportRemoteCoverageList: (body: Models.ImportedCoverage.Create) =>
    post<Array<Models.ImportedCoverage.Item>>('ImportRemoteCoverageList', body),
  RemoveImportedCoverage: (id: number) => post(`RemoveImportedCoverage/${id}`),
}));

const ProductRelease = createController('ProductRelease', ({ get, post }) => ({
  List: (filter?: QuerySpecification) => post<PagedResult<Models.ProductRelease.Item>>('List', filter),
  Details: (id: number) => get<Models.ProductRelease.Item>(`Details/${id}`),
  Create: (body: Models.ProductRelease.Create) => post<Models.ProductRelease.Item>('Create', body),
  Update: (body: Models.ProductRelease.Update) => post<Models.ProductRelease.Item>('Update', body),
  Remove: (id: number) => post(`Remove/${id}`),
  Register: () => post('Register'),
}));

const Report = createController('Report', ({ get }) => ({
  GetReport: (contractId: number) => get<string>(`GetReport/${contractId}`),
}));

export const agent = {
  Company,
  ContractItem,
  ContractDocument,
  ProductChannel,
  ProductCondition,
  ProductConfiguration,
  ProductCoverage,
  ProductRelease,
  Report,
  EntityOptions,
  Identity,
};
