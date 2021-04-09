import { Directive, OnDestroy, Input, ElementRef, ViewContainerRef, NgZone, Renderer2, ChangeDetectorRef } from '@angular/core';
import { IgxDragDirective } from '../../directives/drag-drop/drag-drop.directive';
import { Subscription, fromEvent } from 'rxjs';
import { IgxColumnComponent } from '../columns/column.component';
import { PlatformUtil } from '../../core/utils';
import { IgxColumnMovingService } from './moving.service';

/**
 * @hidden
 * @internal
 */
@Directive({ selector: '[igxColumnMovingDrag]' })
export class IgxColumnMovingDragDirective extends IgxDragDirective implements OnDestroy {

    @Input('igxColumnMovingDrag')
    public column: IgxColumnComponent;

    public get draggable(): boolean {
        return this.column && (this.column.movable || (this.column.groupable && !this.column.columnGroup));
    }

    public get icon(): HTMLElement {
        return this.cms.icon;
    }

    private subscription$: Subscription;
    private _ghostClass = 'igx-grid__drag-ghost-image';
    private ghostImgIconClass = 'igx-grid__drag-ghost-image-icon';
    private ghostImgIconGroupClass = 'igx-grid__drag-ghost-image-icon-group';
    private columnSelectedClass = 'igx-grid__th--selected';

    constructor(
        public element: ElementRef<HTMLElement>,
        public viewContainer: ViewContainerRef,
        public zone: NgZone,
        public renderer: Renderer2,
        public cdr: ChangeDetectorRef,
        private cms: IgxColumnMovingService,
        _platformUtil: PlatformUtil,
    ) {
        super(cdr, element, viewContainer, zone, renderer, _platformUtil);
    }

    public ngOnDestroy() {
        this._unsubscribe();
    }

    public onEscape(event) {
        this.cms.cancelDrop = true;
        this.onPointerUp(event);
    }

    public onPointerDown(event) {
        if (!this.draggable || event.target.getAttribute('draggable') === 'false') {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        this._removeOnDestroy = false;
        this.cms.column = this.column;
        this.ghostClass = this._ghostClass;

        super.onPointerDown(event);
        this.column.grid.cdr.detectChanges();

        const args = {
            source: this.column
        };
        this.column.grid.onColumnMovingStart.emit(args);

        this.subscription$ = fromEvent(this.column.grid.document.defaultView, 'keydown').subscribe((ev: KeyboardEvent) => {
            if (ev.key === this.platformUtil.KEYMAP.ESCAPE) {
                this.onEscape(ev);
            }
        });
    }

    public onPointerMove(event) {
        event.preventDefault();
        super.onPointerMove(event);

        if (this._dragStarted && this.ghostElement && !this.cms.column) {
            this.cms.column = this.column;
            this.column.grid.cdr.detectChanges();
        }

        if (this.cms.column) {
            const args = {
                source: this.column,
                cancel: false
            };
            this.column.grid.onColumnMoving.emit(args);

            if (args.cancel) {
                this.onEscape(event);
            }
        }
    }

    public onPointerUp(event) {
        // Run it explicitly inside the zone because sometimes onPointerUp executes after the code below.
        this.zone.run(() => {
            super.onPointerUp(event);
            this.cms.column = null;
            this.column.grid.cdr.detectChanges();
        });

        this._unsubscribe();
    }

    protected createGhost(pageX: number, pageY: number) {
        super.createGhost(pageX, pageY);

        this.ghostElement.style.height = null;
        this.ghostElement.style.minWidth = null;
        this.ghostElement.style.flexBasis = null;
        this.ghostElement.style.position = null;

        this.renderer.removeClass( this.ghostElement, this.columnSelectedClass);

        const icon = document.createElement('i');
        const text = document.createTextNode('block');
        icon.appendChild(text);

        icon.classList.add('material-icons');
        this.cms.icon = icon;

        if (!this.column.columnGroup) {
            this.renderer.addClass(icon, this.ghostImgIconClass);

            this.ghostElement.insertBefore(icon, this.ghostElement.firstElementChild);

            this.ghostLeft = this._ghostStartX = pageX - ((this.ghostElement.getBoundingClientRect().width / 3) * 2);
            this.ghostTop = this._ghostStartY = pageY - ((this.ghostElement.getBoundingClientRect().height / 3) * 2);
        } else {
            this.ghostElement.insertBefore(icon, this.ghostElement.childNodes[0]);

            this.renderer.addClass(icon, this.ghostImgIconGroupClass);
            this.ghostElement.children[0].style.paddingLeft = '0px';

            this.ghostLeft = this._ghostStartX = pageX - ((this.ghostElement.getBoundingClientRect().width / 3) * 2);
            this.ghostTop = this._ghostStartY = pageY - ((this.ghostElement.getBoundingClientRect().height / 3) * 2);
        }
    }

    private _unsubscribe() {
        if (this.subscription$) {
            this.subscription$.unsubscribe();
            this.subscription$ = null;
        }
    }
}
