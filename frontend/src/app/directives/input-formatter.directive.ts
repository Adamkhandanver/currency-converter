import { Directive, HostListener, ElementRef, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: '[appCurrencyInput]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputFormatterDirective),
      multi: true
    }
  ],
  standalone: true
})
export class InputFormatterDirective implements ControlValueAccessor {
  private onChange!: (value: number) => void;
  private onTouched!: () => void;

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = this.parseValue(input.value);

    if (!isNaN(value)) {
      this.onChange(value);
    }
  }

  @HostListener('blur')
  onBlur(): void {
    this.onTouched();
    const value = this.parseValue(this.el.nativeElement.value);
    this.formatInput(value);
  }

  writeValue(value: number): void {
    this.formatInput(value);
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  private parseValue(value: string): number {
    const cleaned = value.replace(/[^\d.-]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }

  private formatInput(value: number | null): void {
    if (value == null || isNaN(value) || value === 0) {
      this.el.nativeElement.value = '';
      return;
    }

    const formatted = value.toFixed(2);
    this.el.nativeElement.value = formatted;
  }
}