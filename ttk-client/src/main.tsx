import ReactDOM from 'react-dom/client';
import Application from './app';
import '@src/styles/theme.scss';
import '@src/styles/main.scss';
import '@src/styles/form.scss';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<Application />);
