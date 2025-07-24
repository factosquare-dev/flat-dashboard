import React from 'react';
import FormInput, { FormInputProps } from './FormInput';
import FormSelect, { FormSelectProps } from './FormSelect';
import FormTextarea, { FormTextareaProps } from './FormTextarea';

type BaseFieldProps = {
  fieldType?: 'input' | 'select' | 'textarea';
};

type FormFieldProps = BaseFieldProps & (
  | ({ fieldType?: 'input' } & FormInputProps)
  | ({ fieldType: 'select' } & FormSelectProps)
  | ({ fieldType: 'textarea' } & FormTextareaProps)
);

/**
 * Unified FormField component that renders appropriate form control based on fieldType
 * Defaults to input if fieldType is not specified
 */
const FormField = React.forwardRef<
  HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
  FormFieldProps
>((props, ref) => {
  const { fieldType = 'input', ...fieldProps } = props;

  switch (fieldType) {
    case 'select':
      return <FormSelect ref={ref as React.Ref<HTMLSelectElement>} {...(fieldProps as FormSelectProps)} />;
    case 'textarea':
      return <FormTextarea ref={ref as React.Ref<HTMLTextAreaElement>} {...(fieldProps as FormTextareaProps)} />;
    case 'input':
    default:
      return <FormInput ref={ref as React.Ref<HTMLInputElement>} {...(fieldProps as FormInputProps)} />;
  }
});

FormField.displayName = 'FormField';

export default FormField;