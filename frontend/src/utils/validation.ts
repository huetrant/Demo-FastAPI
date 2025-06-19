// Form validation rules for Ant Design forms

export const validationRules = {
  required: {
    required: true,
    message: 'This field is required',
  },
  
  email: {
    type: 'email' as const,
    message: 'Please enter a valid email address',
  },
  
  minLength: (min: number) => ({
    min,
    message: `Must be at least ${min} characters`,
  }),
  
  maxLength: (max: number) => ({
    max,
    message: `Must be no more than ${max} characters`,
  }),
  
  pattern: (pattern: RegExp, message: string) => ({
    pattern,
    message,
  }),
  
  number: {
    type: 'number' as const,
    message: 'Please enter a valid number',
  },
  
  positiveNumber: {
    type: 'number' as const,
    min: 0,
    message: 'Must be a positive number',
  },
  
  url: {
    type: 'url' as const,
    message: 'Please enter a valid URL',
  },
  
  phone: {
    pattern: /^[\+]?[1-9][\d]{0,15}$/,
    message: 'Please enter a valid phone number',
  },
  
  username: {
    pattern: /^[a-zA-Z0-9_]{3,20}$/,
    message: 'Username must be 3-20 characters and contain only letters, numbers, and underscores',
  },
  
  password: {
    min: 6,
    message: 'Password must be at least 6 characters',
  },
  
  strongPassword: {
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    message: 'Password must contain at least 8 characters with uppercase, lowercase, number, and special character',
  },
}

// Common validation rule combinations
export const commonRules = {
  name: [validationRules.required, validationRules.maxLength(100)],
  email: [validationRules.required, validationRules.email],
  username: [validationRules.required, validationRules.username],
  password: [validationRules.required, validationRules.password],
  strongPassword: [validationRules.required, validationRules.strongPassword],
  phone: [validationRules.phone],
  url: [validationRules.url],
  description: [validationRules.maxLength(500)],
  price: [validationRules.required, validationRules.positiveNumber],
  quantity: [validationRules.required, validationRules.positiveNumber],
}

// Custom validators
export const customValidators = {
  confirmPassword: (getFieldValue: (name: string) => any) => ({
    validator(_: any, value: any) {
      if (!value || getFieldValue('password') === value) {
        return Promise.resolve()
      }
      return Promise.reject(new Error('Passwords do not match'))
    },
  }),
  
  uniqueValue: (existingValues: string[], currentValue?: string) => ({
    validator(_: any, value: any) {
      if (!value) return Promise.resolve()
      
      const isDuplicate = existingValues.some(
        existing => existing.toLowerCase() === value.toLowerCase() && existing !== currentValue
      )
      
      if (isDuplicate) {
        return Promise.reject(new Error('This value already exists'))
      }
      
      return Promise.resolve()
    },
  }),
  
  fileSize: (maxSizeMB: number) => ({
    validator(_: any, value: any) {
      if (!value || !value.file) return Promise.resolve()
      
      const fileSizeMB = value.file.size / 1024 / 1024
      if (fileSizeMB > maxSizeMB) {
        return Promise.reject(new Error(`File size must be less than ${maxSizeMB}MB`))
      }
      
      return Promise.resolve()
    },
  }),
  
  imageFile: {
    validator(_: any, value: any) {
      if (!value || !value.file) return Promise.resolve()
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(value.file.type)) {
        return Promise.reject(new Error('Only image files are allowed'))
      }
      
      return Promise.resolve()
    },
  },
}

// Validation helpers
export const validateForm = (form: any) => {
  return form.validateFields()
}

export const resetForm = (form: any) => {
  form.resetFields()
}

export const setFormErrors = (form: any, errors: Record<string, string>) => {
  const formErrors = Object.entries(errors).map(([field, message]) => ({
    name: field,
    errors: [message],
  }))
  
  form.setFields(formErrors)
}
