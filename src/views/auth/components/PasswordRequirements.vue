<template>
  <div v-if="password" class="PasswordRequirements">
    <h4>{{ $t('auth.forms.passwordRequirements.title') }}</h4>
    <ul>
      <li 
        v-for="requirement in requirementsMet" 
        :key="requirement.key"
        :class="{ 'requirement-met': requirement.met }"
      >
        <v-icon 
          :icon="requirement.met ? '$checkCircle' : '$closeCircle'" 
          :color="requirement.met ? 'success' : 'error'" 
          size="16" 
        />
        {{ $t(requirement.translationKey) }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { toRef } from 'vue'
import { usePasswordValidation } from '@/composables/usePasswordValidation'

const props = defineProps<{
  password: string
}>()

const passwordRef = toRef(props, 'password')
const { requirementsMet } = usePasswordValidation(passwordRef)
</script>

<style scoped lang="scss">
.PasswordRequirements {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;

  h4 {
    font-size: 0.875rem;
    font-weight: 600;
    color: #334155;
    margin: 0 0 0.75rem 0;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    li {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: #64748b;
      transition: color 0.2s ease;

      &.requirement-met {
        color: #059669;
      }
    }
  }
}
</style>
