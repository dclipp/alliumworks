import { ButtonBarButton } from './button-bar-button';

export interface ButtonBarButtonViewModel extends ButtonBarButton {
    disabledAttr: 'disabled' | null;
    additionalClassAttr: string | null;
    tooltipAttr: string | null;
    moreWithSuboptions?: {
        caption: string;
        suboptions: Array<{ readonly iconName: string, readonly value: string, readonly caption: string }>;
    };
}