import { Aq4wComponent } from 'src/app/aq4w-component';

export abstract class SeparableWindowOwner extends Aq4wComponent {
    public abstract get separableWindowOwnerKey(): string;

    public abstract moveToMainWindow(): void;
    public abstract focusSeparateWindow(): void;
}