// ============================================================
// Admin Enums - Local definitions + re-exports from @survey/types
// Using const objects with 'as const' for erasableSyntaxOnly compatibility
// ============================================================

// ============ Re-export shared enums from @survey/types ============
export {
  // Enums
  QuestionType,
  NpsQuestionType,
  RatingStyle,
  YesNoStyle,
  ButtonStyle,
  ProgressBarStyle,
  // Static labels (fallbacks)
  QuestionTypeLabels as SharedQuestionTypeLabels,
  RatingStyleLabels as SharedRatingStyleLabels,
  YesNoStyleLabels as SharedYesNoStyleLabels,
  ButtonStyleLabels as SharedButtonStyleLabels,
  ProgressBarStyleLabels as SharedProgressBarStyleLabels,
} from "@survey/types";

// Re-import types for use in this file
import type {
  QuestionType,
  RatingStyle,
  YesNoStyle,
  ButtonStyle,
  ProgressBarStyle,
} from "@survey/types";

// ============ Admin-Only Enums ============

// User & Namespace Enums
export const SubscriptionTier = {
  Free: 0,
  Pro: 1,
  Enterprise: 2,
} as const;
export type SubscriptionTier = (typeof SubscriptionTier)[keyof typeof SubscriptionTier];

export const MemberRole = {
  Owner: 0,
  Admin: 1,
  Member: 2,
  Viewer: 3,
  Respondent: 4,
} as const;
export type MemberRole = (typeof MemberRole)[keyof typeof MemberRole];

// Survey Enums
export const SurveyStatus = {
  Draft: 0,
  Published: 1,
  Closed: 2,
  Archived: 3,
} as const;
export type SurveyStatus = (typeof SurveyStatus)[keyof typeof SurveyStatus];

export const SurveyType = {
  Classic: 0,
  CustomerExperience: 1,
  Conversational: 2,
  Research: 3,
  Assessment360: 4,
} as const;
export type SurveyType = (typeof SurveyType)[keyof typeof SurveyType];

export const CxMetricType = {
  NPS: 0,
  CES: 1,
  CSAT: 2,
} as const;
export type CxMetricType = (typeof CxMetricType)[keyof typeof CxMetricType];

// Logic Enums
export const LogicOperator = {
  Equals: 0,
  NotEquals: 1,
  Contains: 2,
  NotContains: 3,
  GreaterThan: 4,
  LessThan: 5,
  GreaterThanOrEquals: 6,
  LessThanOrEquals: 7,
  IsEmpty: 8,
  IsNotEmpty: 9,
  IsAnswered: 10,
  IsNotAnswered: 11,
} as const;
export type LogicOperator = (typeof LogicOperator)[keyof typeof LogicOperator];

export const LogicAction = {
  Show: 0,
  Hide: 1,
  Skip: 2,
  JumpTo: 3,
  EndSurvey: 4,
} as const;
export type LogicAction = (typeof LogicAction)[keyof typeof LogicAction];

// Link Enums
export const LinkType = {
  Public: 0,
  Unique: 1,
  Campaign: 2,
  Embedded: 3,
  QrCode: 4,
} as const;
export type LinkType = (typeof LinkType)[keyof typeof LinkType];

// Distribution Enums
export const DistributionStatus = {
  Draft: 0,
  Scheduled: 1,
  Sending: 2,
  Sent: 3,
  PartiallyFailed: 4,
  Failed: 5,
  Cancelled: 6,
} as const;
export type DistributionStatus = (typeof DistributionStatus)[keyof typeof DistributionStatus];

export const RecipientStatus = {
  Pending: 0,
  Sent: 1,
  Delivered: 2,
  Opened: 3,
  Clicked: 4,
  Bounced: 5,
  Unsubscribed: 6,
  Failed: 7,
} as const;
export type RecipientStatus = (typeof RecipientStatus)[keyof typeof RecipientStatus];

export const EmailTemplateType = {
  SurveyInvitation: 0,
  SurveyReminder: 1,
  ThankYou: 2,
  Custom: 3,
} as const;
export type EmailTemplateType = (typeof EmailTemplateType)[keyof typeof EmailTemplateType];

// Theme Enums (admin-only)
export const ThemeLayout = {
  Classic: 0,
  Card: 1,
  Conversational: 2,
  Minimal: 3,
} as const;
export type ThemeLayout = (typeof ThemeLayout)[keyof typeof ThemeLayout];

export const LogoPosition = {
  TopLeft: 0,
  TopCenter: 1,
  TopRight: 2,
  BottomLeft: 3,
  BottomCenter: 4,
  BottomRight: 5,
} as const;
export type LogoPosition = (typeof LogoPosition)[keyof typeof LogoPosition];

export const LogoSize = {
  Small: 0,
  Medium: 1,
  Large: 2,
  ExtraLarge: 3,
} as const;
export type LogoSize = (typeof LogoSize)[keyof typeof LogoSize];

export const BackgroundImagePosition = {
  Cover: 0,
  Contain: 1,
  Tile: 2,
  Center: 3,
  TopLeft: 4,
  TopRight: 5,
} as const;
export type BackgroundImagePosition =
  (typeof BackgroundImagePosition)[keyof typeof BackgroundImagePosition];

// Recurring Survey Enums
export const RecurrencePattern = {
  Daily: 0,
  Weekly: 1,
  BiWeekly: 2,
  Monthly: 3,
  Quarterly: 4,
  Custom: 5,
} as const;
export type RecurrencePattern = (typeof RecurrencePattern)[keyof typeof RecurrencePattern];

export const RunStatus = {
  Scheduled: 0,
  Running: 1,
  Completed: 2,
  PartiallyCompleted: 3,
  Failed: 4,
  Cancelled: 5,
} as const;
export type RunStatus = (typeof RunStatus)[keyof typeof RunStatus];

export const AudienceType = {
  StaticList: 0,
  DynamicList: 1,
  AllContacts: 2,
  PreviousRespondents: 3,
} as const;
export type AudienceType = (typeof AudienceType)[keyof typeof AudienceType];

// Analytics Enums
export const NpsCategory = {
  NeedsImprovement: 0,
  Good: 1,
  Great: 2,
  Excellent: 3,
} as const;
export type NpsCategory = (typeof NpsCategory)[keyof typeof NpsCategory];

export const NpsTrendDirection = {
  Up: 0,
  Down: 1,
  Stable: 2,
} as const;
export type NpsTrendDirection = (typeof NpsTrendDirection)[keyof typeof NpsTrendDirection];

export const NpsTrendGroupBy = {
  Day: 0,
  Week: 1,
  Month: 2,
} as const;
export type NpsTrendGroupBy = (typeof NpsTrendGroupBy)[keyof typeof NpsTrendGroupBy];

export const NpsSegmentBy = {
  Date: 0,
  Question: 1,
  CompletionStatus: 2,
} as const;
export type NpsSegmentBy = (typeof NpsSegmentBy)[keyof typeof NpsSegmentBy];

// Export Enums
export const ExportFormat = {
  Csv: 0,
  Excel: 1,
  Json: 2,
} as const;
export type ExportFormat = (typeof ExportFormat)[keyof typeof ExportFormat];

// Namespace Permission Enums
export const NamespacePermission = {
  ViewSurveys: 0,
  CreateSurvey: 1,
  CreateSurveys: 2,
  EditSurvey: 3,
  EditSurveys: 4,
  DeleteSurvey: 5,
  DeleteSurveys: 6,
  ViewResponses: 7,
  ManageUsers: 8,
  ManageMembers: 9,
  ManageNamespace: 10,
  ManageSettings: 11,
  DeleteNamespace: 12,
} as const;
export type NamespacePermission = (typeof NamespacePermission)[keyof typeof NamespacePermission];

// Day of Week (matches .NET System.DayOfWeek)
export const DayOfWeek = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
} as const;
export type DayOfWeek = (typeof DayOfWeek)[keyof typeof DayOfWeek];

// ============ Helper functions for enum display ============
import i18n from "@/i18n";

export function getEnumDisplayName<T extends Record<string, number | string>>(
  enumObj: T,
  value: number
): string {
  const entry = Object.entries(enumObj).find(([, v]) => v === value);
  return entry ? entry[0] : String(value);
}

// Generic enum label getter with localization
export function getEnumLabel(
  translationKeyPrefix: string,
  enumKeyMap: Record<number, string>,
  value: number
): string {
  const key = enumKeyMap[value];
  return key ? i18n.t(`${translationKeyPrefix}.${key}`) : String(value);
}

// ============ Localized Label Getters (Admin-only, using i18n) ============

// Subscription Tier
const subscriptionTierKeys: Record<SubscriptionTier, string> = {
  [SubscriptionTier.Free]: "free",
  [SubscriptionTier.Pro]: "pro",
  [SubscriptionTier.Enterprise]: "enterprise",
};
export const getSubscriptionTierLabel = (value: SubscriptionTier): string =>
  getEnumLabel("enums.subscriptionTier", subscriptionTierKeys, value);
export const SubscriptionTierLabels: Record<SubscriptionTier, string> = {
  [SubscriptionTier.Free]: "Free",
  [SubscriptionTier.Pro]: "Pro",
  [SubscriptionTier.Enterprise]: "Enterprise",
};

// Member Role
const memberRoleKeys: Record<MemberRole, string> = {
  [MemberRole.Owner]: "owner",
  [MemberRole.Admin]: "admin",
  [MemberRole.Member]: "member",
  [MemberRole.Viewer]: "viewer",
  [MemberRole.Respondent]: "respondent",
};
export const getMemberRoleLabel = (value: MemberRole): string =>
  getEnumLabel("enums.memberRole", memberRoleKeys, value);
export const MemberRoleLabels: Record<MemberRole, string> = {
  [MemberRole.Owner]: "Owner",
  [MemberRole.Admin]: "Admin",
  [MemberRole.Member]: "Member",
  [MemberRole.Viewer]: "Viewer",
  [MemberRole.Respondent]: "Respondent",
};

// Survey Status
const surveyStatusKeys: Record<SurveyStatus, string> = {
  [SurveyStatus.Draft]: "draft",
  [SurveyStatus.Published]: "published",
  [SurveyStatus.Closed]: "closed",
  [SurveyStatus.Archived]: "archived",
};
export const getSurveyStatusLabel = (value: SurveyStatus): string =>
  getEnumLabel("enums.surveyStatus", surveyStatusKeys, value);
export const SurveyStatusLabels: Record<SurveyStatus, string> = {
  [SurveyStatus.Draft]: "Draft",
  [SurveyStatus.Published]: "Published",
  [SurveyStatus.Closed]: "Closed",
  [SurveyStatus.Archived]: "Archived",
};

// Question Type (shared enum, admin-specific localized labels)
import { QuestionType as QT } from "@survey/types";
const questionTypeKeys: Record<QuestionType, string> = {
  [QT.SingleChoice]: "singleChoice",
  [QT.MultipleChoice]: "multipleChoice",
  [QT.Text]: "text",
  [QT.LongText]: "longText",
  [QT.Rating]: "rating",
  [QT.Scale]: "scale",
  [QT.Matrix]: "matrix",
  [QT.Date]: "date",
  [QT.DateTime]: "dateTime",
  [QT.FileUpload]: "fileUpload",
  [QT.YesNo]: "yesNo",
  [QT.Dropdown]: "dropdown",
  [QT.NPS]: "nps",
  [QT.Checkbox]: "checkbox",
  [QT.Number]: "number",
  [QT.ShortText]: "shortText",
  [QT.Email]: "email",
  [QT.Phone]: "phone",
  [QT.Url]: "url",
  [QT.Ranking]: "ranking",
};
export const getQuestionTypeLabel = (value: QuestionType): string =>
  getEnumLabel("enums.questionType", questionTypeKeys, value);
export const QuestionTypeLabels: Record<QuestionType, string> = {
  [QT.SingleChoice]: "Single Choice",
  [QT.MultipleChoice]: "Multiple Choice",
  [QT.Text]: "Text",
  [QT.LongText]: "Long Text",
  [QT.Rating]: "Rating",
  [QT.Scale]: "Scale",
  [QT.Matrix]: "Matrix",
  [QT.Date]: "Date",
  [QT.DateTime]: "Date & Time",
  [QT.FileUpload]: "File Upload",
  [QT.YesNo]: "Yes/No",
  [QT.Dropdown]: "Dropdown",
  [QT.NPS]: "NPS",
  [QT.Checkbox]: "Checkbox",
  [QT.Number]: "Number",
  [QT.ShortText]: "Short Text",
  [QT.Email]: "Email",
  [QT.Phone]: "Phone",
  [QT.Url]: "URL",
  [QT.Ranking]: "Ranking",
};

// Rating Style (shared enum, admin-specific localized labels)
import { RatingStyle as RS } from "@survey/types";
const ratingStyleKeys: Record<RatingStyle, string> = {
  [RS.Stars]: "stars",
  [RS.Hearts]: "hearts",
  [RS.Thumbs]: "thumbs",
  [RS.Smileys]: "smileys",
  [RS.Numbers]: "numbers",
};
export const getRatingStyleLabel = (value: RatingStyle): string =>
  getEnumLabel("enums.ratingStyle", ratingStyleKeys, value);
export const RatingStyleLabels: Record<RatingStyle, string> = {
  [RS.Stars]: "Stars",
  [RS.Hearts]: "Hearts",
  [RS.Thumbs]: "Thumbs",
  [RS.Smileys]: "Smileys",
  [RS.Numbers]: "Numbers",
};

// Yes/No Style (shared enum, admin-specific localized labels)
import { YesNoStyle as YNS } from "@survey/types";
const yesNoStyleKeys: Record<YesNoStyle, string> = {
  [YNS.Text]: "text",
  [YNS.Thumbs]: "thumbs",
  [YNS.Toggle]: "toggle",
  [YNS.CheckX]: "checkX",
};
export const getYesNoStyleLabel = (value: YesNoStyle): string =>
  getEnumLabel("enums.yesNoStyle", yesNoStyleKeys, value);
export const YesNoStyleLabels: Record<YesNoStyle, string> = {
  [YNS.Text]: "Text",
  [YNS.Thumbs]: "Thumbs Up/Down",
  [YNS.Toggle]: "Toggle Switch",
  [YNS.CheckX]: "Check/X",
};

// Logic Operator
const logicOperatorKeys: Record<LogicOperator, string> = {
  [LogicOperator.Equals]: "equals",
  [LogicOperator.NotEquals]: "notEquals",
  [LogicOperator.Contains]: "contains",
  [LogicOperator.NotContains]: "notContains",
  [LogicOperator.GreaterThan]: "greaterThan",
  [LogicOperator.LessThan]: "lessThan",
  [LogicOperator.GreaterThanOrEquals]: "greaterThanOrEquals",
  [LogicOperator.LessThanOrEquals]: "lessThanOrEquals",
  [LogicOperator.IsEmpty]: "isEmpty",
  [LogicOperator.IsNotEmpty]: "isNotEmpty",
  [LogicOperator.IsAnswered]: "isAnswered",
  [LogicOperator.IsNotAnswered]: "isNotAnswered",
};
export const getLogicOperatorLabel = (value: LogicOperator): string =>
  getEnumLabel("enums.logicOperator", logicOperatorKeys, value);
export const LogicOperatorLabels: Record<LogicOperator, string> = {
  [LogicOperator.Equals]: "Equals",
  [LogicOperator.NotEquals]: "Not Equals",
  [LogicOperator.Contains]: "Contains",
  [LogicOperator.NotContains]: "Does Not Contain",
  [LogicOperator.GreaterThan]: "Greater Than",
  [LogicOperator.LessThan]: "Less Than",
  [LogicOperator.GreaterThanOrEquals]: "Greater Than or Equals",
  [LogicOperator.LessThanOrEquals]: "Less Than or Equals",
  [LogicOperator.IsEmpty]: "Is Empty",
  [LogicOperator.IsNotEmpty]: "Is Not Empty",
  [LogicOperator.IsAnswered]: "Is Answered",
  [LogicOperator.IsNotAnswered]: "Is Not Answered",
};

// Logic Action
const logicActionKeys: Record<LogicAction, string> = {
  [LogicAction.Show]: "show",
  [LogicAction.Hide]: "hide",
  [LogicAction.Skip]: "skip",
  [LogicAction.JumpTo]: "jumpTo",
  [LogicAction.EndSurvey]: "endSurvey",
};
export const getLogicActionLabel = (value: LogicAction): string =>
  getEnumLabel("enums.logicAction", logicActionKeys, value);
export const LogicActionLabels: Record<LogicAction, string> = {
  [LogicAction.Show]: "Show",
  [LogicAction.Hide]: "Hide",
  [LogicAction.Skip]: "Skip",
  [LogicAction.JumpTo]: "Jump To",
  [LogicAction.EndSurvey]: "End Survey",
};

// Link Type
const linkTypeKeys: Record<LinkType, string> = {
  [LinkType.Public]: "public",
  [LinkType.Unique]: "unique",
  [LinkType.Campaign]: "campaign",
  [LinkType.Embedded]: "embedded",
  [LinkType.QrCode]: "qrCode",
};
export const getLinkTypeLabel = (value: LinkType): string =>
  getEnumLabel("enums.linkType", linkTypeKeys, value);
export const LinkTypeLabels: Record<LinkType, string> = {
  [LinkType.Public]: "Public",
  [LinkType.Unique]: "Unique",
  [LinkType.Campaign]: "Campaign",
  [LinkType.Embedded]: "Embedded",
  [LinkType.QrCode]: "QR Code",
};

// Distribution Status
const distributionStatusKeys: Record<DistributionStatus, string> = {
  [DistributionStatus.Draft]: "draft",
  [DistributionStatus.Scheduled]: "scheduled",
  [DistributionStatus.Sending]: "sending",
  [DistributionStatus.Sent]: "sent",
  [DistributionStatus.PartiallyFailed]: "partiallyFailed",
  [DistributionStatus.Failed]: "failed",
  [DistributionStatus.Cancelled]: "cancelled",
};
export const getDistributionStatusLabel = (value: DistributionStatus): string =>
  getEnumLabel("enums.distributionStatus", distributionStatusKeys, value);
export const DistributionStatusLabels: Record<DistributionStatus, string> = {
  [DistributionStatus.Draft]: "Draft",
  [DistributionStatus.Scheduled]: "Scheduled",
  [DistributionStatus.Sending]: "Sending",
  [DistributionStatus.Sent]: "Sent",
  [DistributionStatus.PartiallyFailed]: "Partially Failed",
  [DistributionStatus.Failed]: "Failed",
  [DistributionStatus.Cancelled]: "Cancelled",
};

// Recipient Status
const recipientStatusKeys: Record<RecipientStatus, string> = {
  [RecipientStatus.Pending]: "pending",
  [RecipientStatus.Sent]: "sent",
  [RecipientStatus.Delivered]: "delivered",
  [RecipientStatus.Opened]: "opened",
  [RecipientStatus.Clicked]: "clicked",
  [RecipientStatus.Bounced]: "bounced",
  [RecipientStatus.Unsubscribed]: "unsubscribed",
  [RecipientStatus.Failed]: "failed",
};
export const getRecipientStatusLabel = (value: RecipientStatus): string =>
  getEnumLabel("enums.recipientStatus", recipientStatusKeys, value);
export const RecipientStatusLabels: Record<RecipientStatus, string> = {
  [RecipientStatus.Pending]: "Pending",
  [RecipientStatus.Sent]: "Sent",
  [RecipientStatus.Delivered]: "Delivered",
  [RecipientStatus.Opened]: "Opened",
  [RecipientStatus.Clicked]: "Clicked",
  [RecipientStatus.Bounced]: "Bounced",
  [RecipientStatus.Unsubscribed]: "Unsubscribed",
  [RecipientStatus.Failed]: "Failed",
};

// Email Template Type
const emailTemplateTypeKeys: Record<EmailTemplateType, string> = {
  [EmailTemplateType.SurveyInvitation]: "surveyInvitation",
  [EmailTemplateType.SurveyReminder]: "surveyReminder",
  [EmailTemplateType.ThankYou]: "thankYou",
  [EmailTemplateType.Custom]: "custom",
};
export const getEmailTemplateTypeLabel = (value: EmailTemplateType): string =>
  getEnumLabel("enums.emailTemplateType", emailTemplateTypeKeys, value);
export const EmailTemplateTypeLabels: Record<EmailTemplateType, string> = {
  [EmailTemplateType.SurveyInvitation]: "Survey Invitation",
  [EmailTemplateType.SurveyReminder]: "Survey Reminder",
  [EmailTemplateType.ThankYou]: "Thank You",
  [EmailTemplateType.Custom]: "Custom",
};

// Button Style (shared enum, admin-specific localized labels)
import { ButtonStyle as BS } from "@survey/types";
const buttonStyleKeys: Record<ButtonStyle, string> = {
  [BS.Rounded]: "rounded",
  [BS.Square]: "square",
  [BS.Pill]: "pill",
};
export const getButtonStyleLabel = (value: ButtonStyle): string =>
  getEnumLabel("enums.buttonStyle", buttonStyleKeys, value);
export const ButtonStyleLabels: Record<ButtonStyle, string> = {
  [BS.Rounded]: "Rounded",
  [BS.Square]: "Square",
  [BS.Pill]: "Pill",
};

// Theme Layout
const themeLayoutKeys: Record<ThemeLayout, string> = {
  [ThemeLayout.Classic]: "classic",
  [ThemeLayout.Card]: "card",
  [ThemeLayout.Conversational]: "conversational",
  [ThemeLayout.Minimal]: "minimal",
};
export const getThemeLayoutLabel = (value: ThemeLayout): string =>
  getEnumLabel("enums.themeLayout", themeLayoutKeys, value);
export const ThemeLayoutLabels: Record<ThemeLayout, string> = {
  [ThemeLayout.Classic]: "Classic",
  [ThemeLayout.Card]: "Card",
  [ThemeLayout.Conversational]: "Conversational",
  [ThemeLayout.Minimal]: "Minimal",
};

// Logo Position
const logoPositionKeys: Record<LogoPosition, string> = {
  [LogoPosition.TopLeft]: "topLeft",
  [LogoPosition.TopCenter]: "topCenter",
  [LogoPosition.TopRight]: "topRight",
  [LogoPosition.BottomLeft]: "bottomLeft",
  [LogoPosition.BottomCenter]: "bottomCenter",
  [LogoPosition.BottomRight]: "bottomRight",
};
export const getLogoPositionLabel = (value: LogoPosition): string =>
  getEnumLabel("enums.logoPosition", logoPositionKeys, value);
export const LogoPositionLabels: Record<LogoPosition, string> = {
  [LogoPosition.TopLeft]: "Top Left",
  [LogoPosition.TopCenter]: "Top Center",
  [LogoPosition.TopRight]: "Top Right",
  [LogoPosition.BottomLeft]: "Bottom Left",
  [LogoPosition.BottomCenter]: "Bottom Center",
  [LogoPosition.BottomRight]: "Bottom Right",
};

// Progress Bar Style (shared enum, admin-specific localized labels)
import { ProgressBarStyle as PBS } from "@survey/types";
const progressBarStyleKeys: Record<ProgressBarStyle, string> = {
  [PBS.None]: "none",
  [PBS.Bar]: "bar",
  [PBS.Percentage]: "percentage",
  [PBS.Steps]: "steps",
  [PBS.Dots]: "dots",
};
export const getProgressBarStyleLabel = (value: ProgressBarStyle): string =>
  getEnumLabel("enums.progressBarStyle", progressBarStyleKeys, value);
export const ProgressBarStyleLabels: Record<ProgressBarStyle, string> = {
  [PBS.None]: "None",
  [PBS.Bar]: "Bar",
  [PBS.Percentage]: "Percentage",
  [PBS.Steps]: "Steps",
  [PBS.Dots]: "Dots",
};

// Background Image Position
const backgroundImagePositionKeys: Record<BackgroundImagePosition, string> = {
  [BackgroundImagePosition.Cover]: "cover",
  [BackgroundImagePosition.Contain]: "contain",
  [BackgroundImagePosition.Tile]: "tile",
  [BackgroundImagePosition.Center]: "center",
  [BackgroundImagePosition.TopLeft]: "topLeft",
  [BackgroundImagePosition.TopRight]: "topRight",
};
export const getBackgroundImagePositionLabel = (value: BackgroundImagePosition): string =>
  getEnumLabel("enums.backgroundImagePosition", backgroundImagePositionKeys, value);
export const BackgroundImagePositionLabels: Record<BackgroundImagePosition, string> = {
  [BackgroundImagePosition.Cover]: "Cover",
  [BackgroundImagePosition.Contain]: "Contain",
  [BackgroundImagePosition.Tile]: "Tile",
  [BackgroundImagePosition.Center]: "Center",
  [BackgroundImagePosition.TopLeft]: "Top Left",
  [BackgroundImagePosition.TopRight]: "Top Right",
};

// Recurrence Pattern
const recurrencePatternKeys: Record<RecurrencePattern, string> = {
  [RecurrencePattern.Daily]: "daily",
  [RecurrencePattern.Weekly]: "weekly",
  [RecurrencePattern.BiWeekly]: "biWeekly",
  [RecurrencePattern.Monthly]: "monthly",
  [RecurrencePattern.Quarterly]: "quarterly",
  [RecurrencePattern.Custom]: "custom",
};
export const getRecurrencePatternLabel = (value: RecurrencePattern): string =>
  getEnumLabel("enums.recurrencePattern", recurrencePatternKeys, value);
export const RecurrencePatternLabels: Record<RecurrencePattern, string> = {
  [RecurrencePattern.Daily]: "Daily",
  [RecurrencePattern.Weekly]: "Weekly",
  [RecurrencePattern.BiWeekly]: "Bi-Weekly",
  [RecurrencePattern.Monthly]: "Monthly",
  [RecurrencePattern.Quarterly]: "Quarterly",
  [RecurrencePattern.Custom]: "Custom",
};

// Run Status
const runStatusKeys: Record<RunStatus, string> = {
  [RunStatus.Scheduled]: "scheduled",
  [RunStatus.Running]: "running",
  [RunStatus.Completed]: "completed",
  [RunStatus.PartiallyCompleted]: "partiallyCompleted",
  [RunStatus.Failed]: "failed",
  [RunStatus.Cancelled]: "cancelled",
};
export const getRunStatusLabel = (value: RunStatus): string =>
  getEnumLabel("enums.runStatus", runStatusKeys, value);
export const RunStatusLabels: Record<RunStatus, string> = {
  [RunStatus.Scheduled]: "Scheduled",
  [RunStatus.Running]: "Running",
  [RunStatus.Completed]: "Completed",
  [RunStatus.PartiallyCompleted]: "Partially Completed",
  [RunStatus.Failed]: "Failed",
  [RunStatus.Cancelled]: "Cancelled",
};

// Audience Type
const audienceTypeKeys: Record<AudienceType, string> = {
  [AudienceType.StaticList]: "staticList",
  [AudienceType.DynamicList]: "dynamicList",
  [AudienceType.AllContacts]: "allContacts",
  [AudienceType.PreviousRespondents]: "previousRespondents",
};
export const getAudienceTypeLabel = (value: AudienceType): string =>
  getEnumLabel("enums.audienceType", audienceTypeKeys, value);
export const AudienceTypeLabels: Record<AudienceType, string> = {
  [AudienceType.StaticList]: "Static List",
  [AudienceType.DynamicList]: "Dynamic List",
  [AudienceType.AllContacts]: "All Contacts",
  [AudienceType.PreviousRespondents]: "Previous Respondents",
};

// NPS Category
const npsCategoryKeys: Record<NpsCategory, string> = {
  [NpsCategory.NeedsImprovement]: "needsImprovement",
  [NpsCategory.Good]: "good",
  [NpsCategory.Great]: "great",
  [NpsCategory.Excellent]: "excellent",
};
export const getNpsCategoryLabel = (value: NpsCategory): string =>
  getEnumLabel("enums.npsCategory", npsCategoryKeys, value);
export const NpsCategoryLabels: Record<NpsCategory, string> = {
  [NpsCategory.NeedsImprovement]: "Needs Improvement",
  [NpsCategory.Good]: "Good",
  [NpsCategory.Great]: "Great",
  [NpsCategory.Excellent]: "Excellent",
};

// NPS Segment By
const npsSegmentByKeys: Record<NpsSegmentBy, string> = {
  [NpsSegmentBy.Date]: "date",
  [NpsSegmentBy.Question]: "question",
  [NpsSegmentBy.CompletionStatus]: "completionStatus",
};
export const getNpsSegmentByLabel = (value: NpsSegmentBy): string =>
  getEnumLabel("enums.npsSegmentBy", npsSegmentByKeys, value);
export const NpsSegmentByLabels: Record<NpsSegmentBy, string> = {
  [NpsSegmentBy.Date]: "Date",
  [NpsSegmentBy.Question]: "Question",
  [NpsSegmentBy.CompletionStatus]: "Completion Status",
};

// Export Format
const exportFormatKeys: Record<ExportFormat, string> = {
  [ExportFormat.Csv]: "csv",
  [ExportFormat.Excel]: "excel",
  [ExportFormat.Json]: "json",
};
export const getExportFormatLabel = (value: ExportFormat): string =>
  getEnumLabel("enums.exportFormat", exportFormatKeys, value);
export const ExportFormatLabels: Record<ExportFormat, string> = {
  [ExportFormat.Csv]: "CSV",
  [ExportFormat.Excel]: "Excel",
  [ExportFormat.Json]: "JSON",
};

// Namespace Permission
const namespacePermissionKeys: Record<NamespacePermission, string> = {
  [NamespacePermission.ViewSurveys]: "viewSurveys",
  [NamespacePermission.CreateSurvey]: "createSurvey",
  [NamespacePermission.CreateSurveys]: "createSurveys",
  [NamespacePermission.EditSurvey]: "editSurvey",
  [NamespacePermission.EditSurveys]: "editSurveys",
  [NamespacePermission.DeleteSurvey]: "deleteSurvey",
  [NamespacePermission.DeleteSurveys]: "deleteSurveys",
  [NamespacePermission.ViewResponses]: "viewResponses",
  [NamespacePermission.ManageUsers]: "manageUsers",
  [NamespacePermission.ManageMembers]: "manageMembers",
  [NamespacePermission.ManageNamespace]: "manageNamespace",
  [NamespacePermission.ManageSettings]: "manageSettings",
  [NamespacePermission.DeleteNamespace]: "deleteNamespace",
};
export const getNamespacePermissionLabel = (value: NamespacePermission): string =>
  getEnumLabel("enums.namespacePermission", namespacePermissionKeys, value);
export const NamespacePermissionLabels: Record<NamespacePermission, string> = {
  [NamespacePermission.ViewSurveys]: "View Surveys",
  [NamespacePermission.CreateSurvey]: "Create Survey",
  [NamespacePermission.CreateSurveys]: "Create Surveys",
  [NamespacePermission.EditSurvey]: "Edit Survey",
  [NamespacePermission.EditSurveys]: "Edit Surveys",
  [NamespacePermission.DeleteSurvey]: "Delete Survey",
  [NamespacePermission.DeleteSurveys]: "Delete Surveys",
  [NamespacePermission.ViewResponses]: "View Responses",
  [NamespacePermission.ManageUsers]: "Manage Users",
  [NamespacePermission.ManageMembers]: "Manage Members",
  [NamespacePermission.ManageNamespace]: "Manage Namespace",
  [NamespacePermission.ManageSettings]: "Manage Settings",
  [NamespacePermission.DeleteNamespace]: "Delete Namespace",
};

// Day of Week
const dayOfWeekKeys: Record<DayOfWeek, string> = {
  [DayOfWeek.Sunday]: "sunday",
  [DayOfWeek.Monday]: "monday",
  [DayOfWeek.Tuesday]: "tuesday",
  [DayOfWeek.Wednesday]: "wednesday",
  [DayOfWeek.Thursday]: "thursday",
  [DayOfWeek.Friday]: "friday",
  [DayOfWeek.Saturday]: "saturday",
};
export const getDayOfWeekLabel = (value: DayOfWeek): string =>
  getEnumLabel("enums.dayOfWeek", dayOfWeekKeys, value);
export const DayOfWeekLabels: Record<DayOfWeek, string> = {
  [DayOfWeek.Sunday]: "Sunday",
  [DayOfWeek.Monday]: "Monday",
  [DayOfWeek.Tuesday]: "Tuesday",
  [DayOfWeek.Wednesday]: "Wednesday",
  [DayOfWeek.Thursday]: "Thursday",
  [DayOfWeek.Friday]: "Friday",
  [DayOfWeek.Saturday]: "Saturday",
};
