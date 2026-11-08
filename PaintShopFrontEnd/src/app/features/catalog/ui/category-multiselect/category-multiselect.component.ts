import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  inject,
  Input,
  Output,
  signal,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

interface CategoryOption {
  id: number;
  label: string;
}

let nextComponentId = 0;

@Component({
  standalone: true,
  selector: 'app-category-multiselect',
  templateUrl: './category-multiselect.component.html',
  styleUrl: './category-multiselect.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CategoryMultiselectComponent),
      multi: true,
    },
  ],
  host: {
    '(focusout)': 'onFocusOut($event)',
    '(keydown.escape)': 'onEscape($event)',
  },
})
export class CategoryMultiselectComponent implements ControlValueAccessor {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) options: readonly CategoryOption[] = [];
  @Output() readonly selectionChange = new EventEmitter<void>();
  @ViewChild('trigger', { static: true }) private trigger!: ElementRef<HTMLButtonElement>;

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly document = inject(DOCUMENT);
  private readonly formDisabled = signal(false);
  private readonly selectionBlocked = signal(false);
  private onChange: (value: number[]) => void = () => {};
  private onTouched: () => void = () => {};

  readonly labelId = `category-multiselect-${++nextComponentId}-label`;
  readonly countId = `${this.labelId}-count`;
  readonly panelId = `${this.labelId}-panel`;
  readonly isOpen = signal(false);
  readonly selectedIds = signal<ReadonlySet<number>>(new Set());

  @Input()
  set selectionDisabled(disabled: boolean) {
    this.selectionBlocked.set(disabled);
    if (disabled) this.isOpen.set(false);
  }

  isDisabled(): boolean {
    return this.formDisabled() || this.selectionBlocked();
  }

  writeValue(value: number[] | null): void {
    this.selectedIds.set(new Set(value ?? []));
  }

  registerOnChange(fn: (value: number[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
    if (disabled) this.isOpen.set(false);
  }

  toggle(): void {
    if (!this.isDisabled()) this.isOpen.update((open) => !open);
  }

  close(): void {
    this.trigger.nativeElement.focus();
    this.isOpen.set(false);
  }

  onEscape(event: Event): void {
    if (!this.isOpen()) return;
    event.stopPropagation();
    this.close();
  }

  onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (next && this.host.nativeElement.contains(next)) return;
    if (next) {
      this.onTouched();
      return;
    }
    queueMicrotask(() => {
      if (!this.host.nativeElement.contains(this.document.activeElement)) this.onTouched();
    });
  }

  onSelectionChange(id: number, checked: boolean): void {
    if (this.isDisabled()) return;
    const selected = new Set(this.selectedIds());
    if (checked) selected.add(id);
    else selected.delete(id);
    this.selectedIds.set(selected);
    this.onChange([...selected]);
    this.selectionChange.emit();
  }
}
