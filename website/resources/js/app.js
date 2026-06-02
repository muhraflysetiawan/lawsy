import './bootstrap';
import Alpine from 'alpinejs';
import supportCenter from './support-chat';

window.Alpine = Alpine;
Alpine.data('supportCenter', supportCenter);
Alpine.start();

