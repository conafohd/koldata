import { i18n } from "@/plugins/i18n";
import { toTypedSchema } from "@vee-validate/zod";
import { useField, useForm } from "vee-validate";
import { computed } from "vue";
import z from "zod";

export class AdminMemberFormService {
    private static readonly validations = {
        memberId: z.string().min(1, { message: i18n.t('forms.errors.required') }),
        associationId: z.string().min(1, { message: i18n.t('forms.errors.required') }),
    }

    public static getMemberPermissionForm(memberId: string | undefined, associationId: string | undefined) {
        const validationSchema = toTypedSchema(
            z.object({
                memberId: this.validations.memberId,
                associationId: this.validations.associationId,
            })
        )

        const { errors, handleSubmit, isSubmitting, meta } = useForm({
            validationSchema,
            initialValues: {
                memberId: memberId,
                associationId: associationId
            }
        })

        const form = {
            memberId: useField<string>('memberId', '', { validateOnValueUpdate: true }),
            associationId: useField<string>('associationId', '', { validateOnValueUpdate: true }),
        }

        const isValid = computed(() => meta.value.valid)

        return { form, errors, handleSubmit, isSubmitting, isValid }
    }
}