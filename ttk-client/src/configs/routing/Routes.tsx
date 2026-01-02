import DevPlayground from '@src/_dev/views/DevPlayground/DevPlayground';
import { RouteMap } from './RoutingUtils';
import Environment from '@src/static/env';
import Home from '@src/views/home/home-view';
import { EmptyStr } from '@src/static/string';
import { hasAccess } from '@src/utils/access-management';

export interface RouterStateArgs {}

export function getRoutes(): RouteMap {
  return {
    [EmptyStr]: {
      title: 'TTK - Ana səhifə',
      element: Home,
      icon: 'Dashboard',
      home: true,
    },
    contract: {
      title: 'Müqavilələr',
      element: () => import('@src/views/contract-item'),
      icon: 'Contract',
      children: {
        'documents/:id': {
          title: 'Sənədlər',
          element: () => import('@src/views/contract-documents'),
          disabled: !hasAccess('CONTRACTDOCUMENT_PAGE_VIEW'),
        },
      },
    },
    'product-coverage': {
      title: 'Təminatlar',
      element: () => import('@src/views/coverage'),
      icon: 'Clover',
      disabled: !hasAccess('COVERAGE_PAGE_VIEW'),
    },
    'product-condition': {
      title: 'Şərtlər',
      element: () => import('@src/views/condition'),
      icon: 'SettingsHeart',
      disabled: !hasAccess('PRODUCTCONDITIONS_PAGE_VIEW'),
    },
    'product-configuration': {
      title: 'Qiymətləndirmə',
      element: () => import('@src/views/product-config'),
      disabled: !hasAccess('PRODUCTCONFIG_PAGE_VIEW'),
      icon: 'Coins',
      children: {
        create: {
          title: 'Yeni konfiqurasiya',
          element: () => import('@src/views/product-config/root/create-view'),
          disabled: !hasAccess('PRODUCTCONFIG_PAGE_CREATE'),
        },
        'update/:id': {
          title: 'Konfiqurasiyaya düzəliş',
          element: () => import('@src/views/product-config/root/update-view'),
          disabled: !hasAccess('PRODUCTCONFIG_PAGE_UPDATE'),
        },
      },
    },
    company: {
      title: 'Şirkətlər',
      element: () => import('@src/views/company'),
      disabled: !hasAccess('COMPANY_PAGE_VIEW'),
      icon: 'Building',
    },
    'product-channel': {
      title: 'Kanallar',
      element: () => import('@src/views/product-channel'),
      disabled: !hasAccess('PRODUCTCHANNEL_PAGE_VIEW'),
      icon: 'Assembly',
    },
    'product-release': {
      title: 'Relizlər',
      element: () => import('@src/views/product-release'),
      disabled: !hasAccess('PRODUCTRELEASES_PAGE_VIEW'),
      icon: 'History',
    },
    'employee-management': {
      title: 'İstifadəçi idarəetməsi',
      element: () => import('@src/views/employee-management'),
      icon: 'UserShield',
      disabled: !hasAccess('ADMIN'),
    },
    _dev: {
      title: 'DEV',
      element: DevPlayground,
      icon: 'Shell',
      disabled: !Environment.IsDevelopment,
    },
    '*': {
      title: '404',
      element: () => import('@src/views/Application/root/NotFound/NotFound'),
      nav: false,
    },
  };
}
