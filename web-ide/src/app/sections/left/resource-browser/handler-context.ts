import { ModalService } from 'src/app/services/modal.service';
import { ButtonBarButton } from 'src/app/view-models/left-section/button-bar/button-bar-button';
import { Yfs } from 'yfs';

export interface HandlerContext {
    modalService(): ModalService;
    dir(): Yfs;
    setIsLoading(isLoading: boolean): void;
    addEscapeKeyListener(): void;
    removeEscapeKeyListener(): void;
    setButtons(buttons: Array<ButtonBarButton>): void;
    getIconNameForResource(name: string, isFolder: boolean, isCollapsed: boolean, extension?: string): string;
    virtualRootPath(): string;
}