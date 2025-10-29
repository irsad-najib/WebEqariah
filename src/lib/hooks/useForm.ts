/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useCallback } from "react";
import { FormState } from "../types";

/**
 * Custom hook untuk form management
 * Ngurus form data, validation, loading state, error handling
 */
export const useForm = <T extends Record<string, any>>(
  initialValues: T,
  validationRules?: Partial<Record<keyof T, (value: any) => string | null>>
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [formState, setFormState] = useState<FormState>({
    loading: false,
    error: null,
    success: false,
  });

  // Function untuk set value field tertentu
  const setValue = useCallback(
    (field: keyof T, value: any) => {
      setValues((prev) => ({ ...prev, [field]: value }));

      // Clear error ketika user mulai ngetik
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors]
  );

  // Function untuk mark field sebagai touched
  const setFieldTouched = useCallback((field: keyof T) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  // Function untuk validate satu field
  const validateField = useCallback(
    (field: keyof T, value: any) => {
      if (!validationRules?.[field]) return null;

      const error = validationRules[field]!(value);
      setErrors((prev) => ({ ...prev, [field]: error || undefined }));
      return error;
    },
    [validationRules]
  );

  // Function untuk validate semua field
  const validateAll = useCallback(() => {
    if (!validationRules) return true;

    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    Object.keys(validationRules).forEach((field) => {
      const key = field as keyof T;
      const error = validationRules[key]!(values[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validationRules]);

  // Function untuk handle submit
  const handleSubmit = useCallback(
    async (onSubmit: (values: T) => Promise<void>, skipValidation = false) => {
      // Validate dulu kalau ada validation rules
      if (!skipValidation && !validateAll()) {
        return;
      }

      setFormState({ loading: true, error: null, success: false });

      try {
        await onSubmit(values);
        setFormState({ loading: false, error: null, success: true });
      } catch (error) {
        setFormState({
          loading: false,
          error: error instanceof Error ? error.message : "An error occurred",
          success: false,
        });
      }
    },
    [values, validateAll]
  );

  // Function untuk reset form
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setFormState({ loading: false, error: null, success: false });
  }, [initialValues]);

  // Function untuk set error manual
  const setError = useCallback((error: string) => {
    setFormState((prev) => ({ ...prev, error, loading: false }));
  }, []);

  // Function untuk set success manual
  const setSuccess = useCallback((success: boolean | string) => {
    setFormState((prev) => ({ ...prev, success, loading: false }));
  }, []);

  return {
    // Form data
    values,
    errors,
    touched,
    formState,

    // Form functions
    setValue,
    setFieldTouched,
    validateField,
    validateAll,
    handleSubmit,
    reset,
    setError,
    setSuccess,
  };
};
