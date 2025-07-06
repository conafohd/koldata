import { i18n } from "@/plugins/i18n"
import { toTypedSchema } from "@vee-validate/zod"
import { useField, useForm } from "vee-validate"
import { computed } from "vue"
import z from "zod"

export class AuthFormValidator {
  private static readonly commonValidations = {
    email: z
      .string()
      .min(1, { message: i18n.t('forms.errors.required') })
      .email({ message: i18n.t('forms.errors.email') }),
    
    password: z
      .string()
      .min(1, { message: i18n.t('forms.errors.required') })
      .min(8, { message: i18n.t('forms.errors.minLength', { min: 8 }) }),

    firstName: z
      .string()
      .min(1, { message: i18n.t('forms.errors.required') })
      .min(2, { message: i18n.t('forms.errors.minLength', { min: 2 }) })
      .max(50, { message: i18n.t('forms.errors.maxLength', { max: 50 }) }),

    lastName: z
      .string()
      .min(1, { message: i18n.t('forms.errors.required') })
      .min(2, { message: i18n.t('forms.errors.minLength', { min: 2 }) })
      .max(50, { message: i18n.t('forms.errors.maxLength', { max: 50 }) }),
    
    stayLoggedIn: z.boolean().optional()
  }

  static getSignInForm() {
    const validationSchema = toTypedSchema(
      z.object({
        email: this.commonValidations.email,
        password: z.string().min(1, { message: i18n.t('forms.errors.required') }),
      })
    )

    const { errors, handleSubmit, isSubmitting, meta } = useForm({
      validationSchema,
      initialValues: {
        email: '',
        password: ''
      }
    })

    const form = {
      email: useField<string>('email', '', { validateOnValueUpdate: true }),
      password: useField<string>('password', '', { validateOnValueUpdate: true }),
    }

    const isValid = computed(() => meta.value.valid)

    return { form, errors, handleSubmit, isSubmitting, isValid }
  }

  static getSignUpForm() {
    const validationSchema = toTypedSchema(
      z.object({
        email: this.commonValidations.email,
        firstName: this.commonValidations.firstName,
        lastName: this.commonValidations.lastName,
        password: this.commonValidations.password,
        confirmPassword: z.string().min(1, { message: i18n.t('forms.errors.required') })
      })
      .refine((data) => data.password === data.confirmPassword, {
        message: i18n.t('auth.passwordsDoNotMatch'),
        path: ['confirmPassword']
      })
    )

    const { errors, handleSubmit, isSubmitting, meta } = useForm({
      validationSchema,
      initialValues: {
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        confirmPassword: ''
      }
    })

    const form = {
      email: useField<string>('email', '', { validateOnValueUpdate: true }),
      firstName: useField<string>('firstName', '', { validateOnValueUpdate: true }),
      lastName: useField<string>('lastName', '', { validateOnValueUpdate: true }),
      password: useField<string>('password', '', { validateOnValueUpdate: true }),
      confirmPassword: useField<string>('confirmPassword', '', { validateOnValueUpdate: true })
    }

    const isValid = computed(() => meta.value.valid)

    return { form, errors, handleSubmit, isSubmitting, isValid }
  }

  static getResetPasswordForm() {
    const validationSchema = toTypedSchema(
      z.object({
        newPassword: this.commonValidations.password,
        confirmNewPassword: z.string().min(1, { message: i18n.t('forms.errors.required') })
      })
      .refine((data) => data.newPassword === data.confirmNewPassword, {
        message: i18n.t('auth.passwordsDoNotMatch'),
        path: ['confirmNewPassword']
      })
    )

    const { errors, handleSubmit, isSubmitting, meta } = useForm({
      validationSchema,
      initialValues: {
        newPassword: '',
        confirmNewPassword: ''
      }
    })

    const form = {
      newPassword: useField<string>('newPassword', '', { validateOnValueUpdate: true }),
      confirmNewPassword: useField<string>('confirmNewPassword', '', { validateOnValueUpdate: true })
    }

    const isValid = computed(() => meta.value.valid)

    return { form, errors, handleSubmit, isSubmitting, isValid }
  }
}