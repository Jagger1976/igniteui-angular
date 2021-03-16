import { AnimationBuilder } from '@angular/animations';
import { AfterViewInit, ContentChildren, Directive, ElementRef, EventEmitter, HostListener,
            Input, OnDestroy, Output, QueryList } from '@angular/core';
import { Subscription } from 'rxjs';
import { Direction, IgxCarouselComponentBase } from '../carousel/carousel-base';
import { IBaseEventArgs, KEYS } from '../core/utils';
import { IgxTabItemDirective } from './tab-item.directive';
import { IgxTabPanelBase, IgxTabsBase } from './tabs.base';

export interface ITabsBaseEventArgs extends IBaseEventArgs {
    readonly owner: IgxTabsDirective;
}

export interface ITabsSelectedIndexChangingEventArgs extends ITabsBaseEventArgs {
    cancel: boolean;
    readonly oldIndex: number;
    newIndex: number;
}

export interface ITabsSelectedItemChangeEventArgs extends ITabsBaseEventArgs {
    readonly oldItem: IgxTabItemDirective;
    readonly newItem: IgxTabItemDirective;
}

@Directive()
export abstract class IgxTabsDirective extends IgxCarouselComponentBase implements IgxTabsBase, AfterViewInit, OnDestroy {

    @Input()
    public get selectedIndex(): number {
        return this._selectedIndex;
    }

    public set selectedIndex(value: number) {
        if (this._selectedIndex !== value) {
            let newIndex = value;
            const oldIndex = this._selectedIndex;
            const args: ITabsSelectedIndexChangingEventArgs = {
                owner: this,
                cancel: false,
                oldIndex,
                newIndex
            };
            this.selectedIndexChanging.emit(args);

            if (!args.cancel) {
                newIndex = args.newIndex;
                this._selectedIndex = newIndex;
                this.selectedIndexChange.emit(this._selectedIndex);
            }

            this.updateSelectedTabs(oldIndex);
        }
    }

    @Input()
    public get disableAnimation() {
        return this._disableAnimation;
    }

    public set disableAnimation(value: boolean) {
        this._disableAnimation = value;
    }

    @Output()
    public selectedIndexChange = new EventEmitter<number>();

    @Output()
    public selectedIndexChanging = new EventEmitter<ITabsSelectedIndexChangingEventArgs>();

    @Output()
    public selectedItemChange = new EventEmitter<ITabsSelectedItemChangeEventArgs>();

    @ContentChildren(IgxTabItemDirective)
    public items: QueryList<IgxTabItemDirective>;

    public get selectedItem(): IgxTabItemDirective {
        return this.items && this.selectedIndex >= 0 && this.selectedIndex < this.items.length ?
            this.items.toArray()[this.selectedIndex] : null;
    }

    /**
     * Returns the underlying DOM element.
     */
     public get nativeElement() {
        return this.element.nativeElement;
    }

    /** @hidden */
    @ContentChildren(IgxTabPanelBase, { descendants: true })
    public panels: QueryList<IgxTabPanelBase>;

    protected _disableAnimation = false;
    protected currentSlide: IgxTabItemDirective;
    protected previousSlide: IgxTabItemDirective;
    protected nextSlide: IgxTabItemDirective;

    private _selectedIndex = -1;
    private _itemChanges$: Subscription;

    /** @hidden */
    constructor(public element: ElementRef, builder: AnimationBuilder) {
        super(builder);
    }

    /** @hidden */
    @HostListener('keydown', ['$event'])
    public keyDown(event: KeyboardEvent) {
        let unsupportedKey = false;
        const previousIndex = this._selectedIndex;
        const hasDisabledItems = this.items.some((item) => item.disabled);
        switch (event.key) {
            case KEYS.RIGHT_ARROW:
            case KEYS.RIGHT_ARROW_IE:
                this._selectedIndex = this._selectedIndex === this.items.length - 1 ? 0 : this._selectedIndex + 1;
                while (hasDisabledItems && this.items.toArray()[this._selectedIndex].disabled &&
                    this._selectedIndex < this.items.length) {
                        this._selectedIndex = this._selectedIndex === this.items.length - 1 ? 0 : this._selectedIndex + 1;
                }
                break;
            case KEYS.LEFT_ARROW:
            case KEYS.LEFT_ARROW_IE:
                this._selectedIndex = this._selectedIndex === 0 ? this.items.length - 1 : this._selectedIndex - 1;
                while (hasDisabledItems && this.items.toArray()[this._selectedIndex].disabled &&
                    this._selectedIndex > 0) {
                        this._selectedIndex = this._selectedIndex === 0 ? this.items.length - 1 : this._selectedIndex - 1;
                }
                break;
            case KEYS.HOME:
                event.preventDefault();
                this._selectedIndex = 0;
                while (this.items.toArray()[this._selectedIndex].disabled &&
                        this._selectedIndex < this.items.length) {
                            this._selectedIndex = this._selectedIndex === this.items.length - 1 ? 0 : this._selectedIndex + 1;
                }
                break;
            case KEYS.END:
                event.preventDefault();
                this._selectedIndex = this.items.length - 1;
                while (hasDisabledItems && this.items.toArray()[this._selectedIndex].disabled &&
                    this._selectedIndex > 0) {
                        this._selectedIndex = this._selectedIndex === 0 ? this.items.length - 1 : this._selectedIndex - 1;
                }
                break;
            case KEYS.TAB:
                this.currentSlide.panelComponent.nativeElement.focus();
                break;
            default:
                event.preventDefault();
                unsupportedKey = true;
                break;
        }
        if (!unsupportedKey) {
            this.updateSelectedTabs(previousIndex, true);
        }
    }

    /** @hidden */
    public ngAfterViewInit(): void {
        if (this._selectedIndex === -1) {
            const hasSelectedTab = this.items.some((tab, i) => {
                if (tab.selected) {
                    this._selectedIndex = i;
                }
                return tab.selected;
            });

            if (!hasSelectedTab && this.hasPanels) {
                this._selectedIndex = 0;
            }
        }

        // Use promise to avoid expression changed after check error
        Promise.resolve().then(() => {
            this.updateSelectedTabs(null, false);
        });

        this._itemChanges$ = this.items.changes.subscribe(() => {
            this.onItemChanges();
        });
    }

    /** @hidden */
    public ngOnDestroy(): void {
        if (this._itemChanges$) {
            this._itemChanges$.unsubscribe();
        }
    }

    /** @hidden */
    public selectTab(tab: IgxTabItemDirective, selected: boolean): void {
        if (!this.items) {
            return;
        }

        const tabs = this.items.toArray();

        if (selected) {
            const index = tabs.indexOf(tab);
            this.selectedIndex = index;
        } else {
            if (tabs.every(t => !t.selected)) {
                this.selectedIndex = -1;
            }
        }
    }

    /** @hidden */
    protected getPreviousElement(): HTMLElement {
        return this.previousSlide.panelComponent.nativeElement;
    }

    /** @hidden */
    protected getCurrentElement(): HTMLElement {
        return this.currentSlide.panelComponent.nativeElement;
    }

    /** @hidden */
    protected scrollTabHeaderIntoView() {
    }

    private get hasPanels() {
        return this.panels && this.panels.length;
    }

    private updateSelectedTabs(oldSelectedIndex: number, raiseEvent = true) {
        if (!this.items) {
            return;
        }

        const tabs = this.items.toArray();
        let newTab: IgxTabItemDirective;
        const oldTab = this.currentSlide;

        // First select the new tab
        if (this._selectedIndex >= 0 && this._selectedIndex < tabs.length) {
            newTab = tabs[this._selectedIndex];
            newTab.selected = true;
        }
        // Then unselect the other tabs
        tabs.forEach((tab, i) => {
            if (i !== this._selectedIndex) {
                tab.selected = false;
            }
        });

        if (this._selectedIndex !== oldSelectedIndex) {
            this.scrollTabHeaderIntoView();
            this.triggerPanelAnimations(oldSelectedIndex);

            if (raiseEvent && newTab !== oldTab) {
                this.selectedItemChange.emit({
                    owner: this,
                    newItem: newTab,
                    oldItem: oldTab
                });
            }
        }
    }

    private onItemChanges() {
        const tabs = this.items.toArray();

        if (this.selectedIndex >= 0 && this.selectedIndex < tabs.length) {

            // Check if there is selected tab
            let selectedIndex = -1;
            this.items.some((tab, i) => {
                if (tab.selected) {
                    selectedIndex = i;
                }
                return tab.selected;
            });

            if (selectedIndex >= 0) {
                // Select the same tab that was previously selected
                Promise.resolve().then(() => {
                    this.selectedIndex = selectedIndex;
                });
            } else {
                // Select the tab on the same index the previous selected tab was
                Promise.resolve().then(() => {
                    this.updateSelectedTabs(null);
                });
            }
        } else if (this.selectedIndex >= tabs.length) {
            // Select the last tab
            Promise.resolve().then(() => {
                this.selectedIndex = tabs.length - 1;
            });
        }
    }

    private triggerPanelAnimations(oldSelectedIndex: number) {
        if (this.disableAnimation) {
            return;
        }

        if (this.hasPanels && this._selectedIndex >= 0) {
            const tabs = this.items.toArray();
            const slide = tabs[this._selectedIndex];

            if (this.currentSlide && !this.currentSlide.selected) {
                slide.direction = this._selectedIndex > oldSelectedIndex ? Direction.NEXT : Direction.PREV;

                if (this.previousSlide && this.previousSlide.previous) {
                    this.previousSlide.previous = false;
                }
                this.currentSlide.direction = slide.direction;

                this.previousSlide = this.currentSlide;
                this.currentSlide = slide;
                this.triggerAnimations();
            } else {
                this.currentSlide = slide;
            }
        }
    }
}
