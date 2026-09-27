import { useCallback, useState } from 'react';

export function useForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const setFieldValue = useCallback((field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
  }, []);
  const validateForm = useCallback(() => {
    const nextErrors = validate ? validate(values) : {};
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [validate, values]);
  const resetForm = useCallback((nextValues = initialValues) => {
    setValues(nextValues);
    setErrors({});
  }, [initialValues]);
  return { values, errors, setErrors, setFieldValue, setValues, validateForm, resetForm };
}
