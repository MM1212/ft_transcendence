import React from 'react';
import { IMaskInput } from 'react-imask';

export interface TFAInputProps
  extends Omit<React.ComponentProps<'input'>, 'onChange'> {
  onChange: (value: string) => void;
}

const TFAInput = React.forwardRef<HTMLInputElement, TFAInputProps>(
  function TFAInput(props, ref) {
    const { ...other } = props;
    return (
      <IMaskInput
        {...(other as any)}
        mask="### ####"
        definitions={{
          '#': /[0-9]/,
        }}
        inputRef={ref}
        overwrite
      />
    );
  }
);

export default TFAInput;
