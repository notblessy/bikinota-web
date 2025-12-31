import * as React from "react";
import { NumericFormat, NumericFormatProps } from "react-number-format";
import { cn } from "@/lib/utils";

export interface NumberInputProps
  extends Omit<NumericFormatProps, "value" | "onValueChange"> {
  value?: number | string;
  onValueChange?: (value: number | undefined) => void;
  className?: string;
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, value, onValueChange, thousandSeparator, decimalSeparator, ...props }, ref) => {
    // Set default decimal separator to comma if thousand separator is dot (Indonesian format)
    // This prevents the error: "Decimal separator can't be same as thousand separator"
    const finalDecimalSeparator = decimalSeparator ?? (thousandSeparator === "." ? "," : ".");
    
    return (
      <NumericFormat
        {...props}
        getInputRef={ref}
        value={value ?? ""}
        onValueChange={(values) => {
          const numValue = values.floatValue;
          onValueChange?.(numValue);
        }}
        thousandSeparator={thousandSeparator}
        decimalSeparator={finalDecimalSeparator}
        className={cn(
          "flex h-10 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      />
    );
  }
);
NumberInput.displayName = "NumberInput";

export { NumberInput };

