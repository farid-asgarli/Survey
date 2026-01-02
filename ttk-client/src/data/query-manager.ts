import { agent } from '@src/api/agent';
import { setupDataContextProvider } from '@src/lib/data-management';

export const InternalEndpoints = {
  Company: agent.Company.List,
  ContractItem: agent.ContractItem.List,
  ProductChannel: agent.ProductChannel.List,
  ProductCondition: agent.ProductCondition.List,
  ProductConfiguration: agent.ProductConfiguration.List,
  ProductRelease: agent.ProductRelease.List,
  ProductCoverage: agent.ProductCoverage.ListInUse,
  EmployeeManagementInUse: agent.Identity.ListUsersInUse,
  EmployeeManagementNotInUse: agent.Identity.ListUsersNotInUse,
};

export type InternalEndpointsModel = typeof InternalEndpoints;

export const { DataCategories, DataContextProvider, queryManager: qm, useDataContext } = setupDataContextProvider(InternalEndpoints);
