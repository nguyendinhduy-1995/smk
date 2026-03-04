'use client';

import { useState, useCallback } from 'react';

type ValidationRule = {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: string) => string | null;
    message?: string;
};

type FieldErrors = Record<string, string | null>;
type FieldValues = Record<string, string>;

export function useFormValidation(rules: Record<string, ValidationRule>) {
    const [errors, setErrors] = useState<FieldErrors>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const validateField = useCallback((name: string, value: string): string | null => {
        const rule = rules[name];
        if (!rule) return null;

        if (rule.required && !value.trim()) {
            return rule.message || 'Trường này bắt buộc';
        }
        if (rule.minLength && value.length < rule.minLength) {
            return `Tối thiểu ${rule.minLength} ký tự`;
        }
        if (rule.maxLength && value.length > rule.maxLength) {
            return `Tối đa ${rule.maxLength} ký tự`;
        }
        if (rule.pattern && !rule.pattern.test(value)) {
            return rule.message || 'Giá trị không hợp lệ';
        }
        if (rule.custom) {
            return rule.custom(value);
        }
        return null;
    }, [rules]);

    const validate = useCallback((name: string, value: string) => {
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
        setTouched(prev => ({ ...prev, [name]: true }));
        return error;
    }, [validateField]);

    const validateAll = useCallback((values: FieldValues): boolean => {
        const newErrors: FieldErrors = {};
        const newTouched: Record<string, boolean> = {};
        let valid = true;

        for (const [name] of Object.entries(rules)) {
            const error = validateField(name, values[name] || '');
            newErrors[name] = error;
            newTouched[name] = true;
            if (error) valid = false;
        }

        setErrors(newErrors);
        setTouched(newTouched);
        return valid;
    }, [rules, validateField]);

    const getFieldProps = useCallback((name: string, value: string) => ({
        onBlur: () => validate(name, value),
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            if (touched[name]) validate(name, e.target.value);
        },
        style: touched[name] && errors[name] ? { borderColor: '#ef4444', boxShadow: '0 0 0 2px rgba(239,68,68,0.15)' } as React.CSSProperties : undefined,
    }), [validate, touched, errors]);

    const FieldError = useCallback(({ name }: { name: string }) => {
        if (!touched[name] || !errors[name]) return null;
        return (
            <div style= {{ fontSize: 11, color: '#ef4444', marginTop: 2, fontWeight: 500 }
    }>
                ⚠️ { errors[name] }
    </div>
        );
}, [touched, errors]);

const reset = useCallback(() => {
    setErrors({});
    setTouched({});
}, []);

return { errors, touched, validate, validateAll, getFieldProps, FieldError, reset, isValid: Object.values(errors).every(e => !e) };
}
