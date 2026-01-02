import React from 'react';
import Bell from './root/Bell';
import Close from './root/Close';
import HalfMoon from './root/HalfMoon';
import Menu from './root/Menu';
import Plus from './root/Plus';
import Reload from './root/Reload';
import Sun from './root/Sun';
import Dashboard from './root/Dashboard';
import Shell from './root/Shell';
import Coins from './root/Coins';
import Clover from './root/Clover';
import SettingsHeart from './root/SettingsHeart';
import Assembly from './root/Assembly';
import Building from './root/Building';
import Trash from './root/Trash';
import AlertCircle from './root/AlertCircle';
import Check from './root/Check';
import Search from './root/Search';
import History from './root/History';
import Info from './root/Info';
import MedicalCross from './root/MedicalCross';
import List from './root/List';
import ProgressCheck from './root/ProgressCheck';
import Document from './root/Document';
import View from './root/View';
import Pencil from './root/Pencil';
import { RichTextIcons } from '@src/lib/RichText/icons';
import Print from './root/Print';
import ArrowLeft from './root/ArrowLeft';
import Upload from './root/Upload';
import Template from './root/Template';
import DeviceFloppy from './root/DeviceFloppy';
import Adjustments from './root/Adjustments';
import Eye from './root/Eye';
import AdjustmentsCancel from './root/AdjustmentsCancel';
import Hash from './root/Hash';
import ABC from './root/ABC';
import ChartArcs from './root/ChartArcs';
import PlaylistX from './root/PlaylistX';
import CalendarTime from './root/CalendarTime';
import Contract from './root/Contract';
import IdBadge from './root/IdBadge';
import Copy from './root/Copy';
import User from './root/User';
import SearchOff from './root/SearchOff';
import DatabaseX from './root/DatabaseX';
import Lock from './root/Lock';
import DotsVertical from './root/DotsVertical';
import SquareRounded from './root/SquareRounded';
import ScriptX from './root/ScriptX';
import Download from './root/Download';
import UserShield from './root/UserShield';
import PencilCheck from './root/PencilCheck';
import HomeCancel from './root/HomeCancel';
import UserCancel from './root/UserCancel';

const AppIcons = {
  ABC,
  Adjustments,
  AdjustmentsCancel,
  AlertCircle,
  ArrowLeft,
  Assembly,
  Bell,
  Building,
  CalendarTime,
  ChartArcs,
  Check,
  Coins,
  Close,
  Clover,
  Contract,
  Copy,
  Dashboard,
  DatabaseX,
  DeviceFloppy,
  Document,
  DotsVertical,
  Download,
  Eye,
  HalfMoon,
  Hash,
  History,
  HomeCancel,
  IdBadge,
  Info,
  List,
  Lock,
  MedicalCross,
  Menu,
  Pencil,
  PencilCheck,
  PlaylistX,
  Plus,
  Print,
  ProgressCheck,
  Reload,
  ScriptX,
  Search,
  SearchOff,
  SettingsHeart,
  Shell,
  SquareRounded,
  Sun,
  Template,
  Trash,
  Upload,
  User,
  UserCancel,
  UserShield,
  View,
  ...RichTextIcons,
};

export const Icon = ({
  name,
  size = '1.25rem',
  color = 'currentColor',
  ...props
}: JSX.IntrinsicElements['svg'] & {
  name: AppIcon;
  size?: string | number;
}) => {
  return React.createElement(AppIcons[name], {
    viewBox: '0 0 24 24',
    'aria-hidden': true,
    stroke: color,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeWidth: 2,
    fill: 'none',
    focusable: false,
    ...props,
    width: size,
    height: size,
  });
};

export type AppIcon = keyof typeof AppIcons;
