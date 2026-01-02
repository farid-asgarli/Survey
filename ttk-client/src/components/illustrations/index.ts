import Error from './root/Error';
import Network from './root/Network';
import Void from './root/Void';
import Warning from './root/Warning';

export const AppIllustrations = {
  Error,
  Network,
  Void,
  Warning,
} as const;

export type ApplicationIllustration = React.ForwardRefExoticComponent<
  Omit<React.SVGProps<SVGSVGElement>, 'ref'> & React.RefAttributes<SVGSVGElement>
>;
