import { Directive, Host, Input, EventEmitter, OnDestroy, Output } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';
import { IgxToggleDirective, ToggleViewCancelableEventArgs, ToggleViewEventArgs } from '../../directives/toggle/toggle.directive';
import {
    AbsoluteScrollStrategy,
    ConnectedPositioningStrategy,
    HorizontalAlignment,
    OverlaySettings,
    PositionSettings,
    VerticalAlignment
} from '../../services/public_api';
import { IgxColumnActionsComponent } from '../column-actions/column-actions.component';
import { ColumnDisplayOrder } from '../common/enums';
import { IColumnToggledEventArgs } from '../common/events';
import { IgxGridToolbarComponent } from './grid-toolbar.component';


/**
 * Base class for the pinning/hiding column and exporter actions.
 *
 * @hidden @internal
 */
@Directive()
export abstract class BaseToolbarDirective implements OnDestroy {
    /**
     * Sets the height of the column list in the dropdown.
     */
    @Input()
    public columnListHeight: string;

    /**
     * Title text for the column action component
     */
    @Input()
    public title: string;

    /**
     * The placeholder text for the search input.
     */
    @Input()
    public prompt: string;

    /**
     * Emits an event before the toggle container is opened.
     */
    @Output()
    public opening = new EventEmitter<ToggleViewCancelableEventArgs>();
    /**
     * Emits an event after the toggle container is opened.
     */

    @Output()
    public opened = new EventEmitter<ToggleViewEventArgs>();
    /**
     * Emits an event before the toggle container is closed.
     */

     @Output()
    public closing = new EventEmitter<ToggleViewEventArgs>();
    /**
     * Emits an event after the toggle container is closed.
     */

     @Output()
    public closed = new EventEmitter<ToggleViewEventArgs>();

    /**
     * Emits when after a column's checked state is changed
     */
    @Output()
    public columnToggle = new EventEmitter<IColumnToggledEventArgs>();

    private $destroyer = new Subject<boolean>();
    private $sub: Subscription;

    /**
     * Returns the grid containing this component.
     */
    public get grid() {
        return this.toolbar.grid;
    }

    constructor(@Host() protected toolbar: IgxGridToolbarComponent) { }

    public ngOnDestroy() {
        this.$destroyer.next(true);
    }

    /** @hidden @internal */
    public toggle(anchorElement: HTMLElement, toggleRef: IgxToggleDirective, actions?: IgxColumnActionsComponent): void {
        if (actions) {
            this._setupListeners(toggleRef, actions);
            const setHeight = () => actions.columnsAreaMaxHeight = this.columnListHeight ?? `${Math.max(this.grid.calcHeight, 200)}px`;
            toggleRef.onOpening.pipe(first()).subscribe(setHeight);
        }
        toggleRef.toggle({ ..._makeOverlaySettings(), ...{ target: anchorElement, outlet: this.grid.outlet,
            excludeFromOutsideClick: [anchorElement] }});

    }

    /** @hidden @internal */
    public focusSearch(columnActions: HTMLElement) {
        columnActions.querySelector('input')?.focus();
    }

    private _setupListeners(toggleRef: IgxToggleDirective, actions? : IgxColumnActionsComponent) {
        if (actions){
            if (!this.$sub || this.$sub.closed){
                this.$sub = actions.columnToggled.subscribe((event) => this.columnToggle.emit(event));
            } else {
                this.$sub.unsubscribe();
            }
        }
        /** The if statement prevents emitting open and close events twice  */
        if (toggleRef.collapsed) {
            toggleRef.onOpening.pipe(first(), takeUntil(this.$destroyer)).subscribe((event) => this.opening.emit(event));
            toggleRef.onOpened.pipe(first(), takeUntil(this.$destroyer)).subscribe((event) => this.opened.emit(event));
        } else {
            toggleRef.onClosing.pipe(first(), takeUntil(this.$destroyer)).subscribe((event) => this.closing.emit(event));
            toggleRef.onClosed.pipe(first(), takeUntil(this.$destroyer)).subscribe((event) => this.closed.emit(event));
        }
    }
}

/**
 * @hidden @internal
 * Base class for pinning/hiding column actions
 */
@Directive()
export abstract class BaseToolbarColumnActionsDirective extends BaseToolbarDirective {
    @Input()
    public hideFilter = false;

    @Input()
    public filterCriteria = '';

    @Input()
    public columnDisplayOrder: ColumnDisplayOrder = ColumnDisplayOrder.DisplayOrder;

    @Input()
    public columnsAreaMaxHeight = '100%';

    @Input()
    public uncheckAllText: string;

    @Input()
    public checkAllText: string;

    @Input()
    public indentetion = 30;

    protected columnActionsUI: IgxColumnActionsComponent;

    public checkAll() {
        this.columnActionsUI.checkAllColumns();
    }

    public uncheckAll() {
        this.columnActionsUI.uncheckAllColumns();
    }
}

const _makeOverlaySettings = (): OverlaySettings => {
    const positionSettings: PositionSettings = {
        horizontalDirection: HorizontalAlignment.Left,
        horizontalStartPoint: HorizontalAlignment.Right,
        verticalDirection: VerticalAlignment.Bottom,
        verticalStartPoint: VerticalAlignment.Bottom
    };
    return {
        positionStrategy: new ConnectedPositioningStrategy(positionSettings),
        scrollStrategy: new AbsoluteScrollStrategy(),
        modal: false,
        closeOnEscape: true,
        closeOnOutsideClick: true
    };
};
