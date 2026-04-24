import { computed, type Ref } from 'vue'

export interface PasswordRequirement {
  key: string
  test: (password: string) => boolean
  translationKey: string
}

export const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  {
    key: 'minLength',
    test: (password: string) => password.length >= 6,
    translationKey: 'auth.forms.passwordRequirements.minLength'
  },
  {
    key: 'uppercase',
    test: (password: string) => /[A-Z]/.test(password),
    translationKey: 'auth.forms.passwordRequirements.uppercase'
  },
  {
    key: 'lowercase',
    test: (password: string) => /[a-z]/.test(password),
    translationKey: 'auth.forms.passwordRequirements.lowercase'
  },
  {
    key: 'number',
    test: (password: string) => /\d/.test(password),
    translationKey: 'auth.forms.passwordRequirements.number'
  }
]

export function usePasswordValidation(password: Ref<string>) {
  const isPasswordValid = computed(() => {
    return PASSWORD_REQUIREMENTS.every(req => req.test(password.value))
  })

  const requirementsMet = computed(() => {
    return PASSWORD_REQUIREMENTS.map(req => ({
      ...req,
      met: req.test(password.value)
    }))
  })

  return {
    isPasswordValid,
    requirementsMet,
    requirements: PASSWORD_REQUIREMENTS
  }
}
