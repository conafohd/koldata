import { AssociationInterventionSector } from "@/models/enums/associations/AssociationInterventionSector";
import { AssociationType } from "@/models/enums/associations/AssociationType";
import type { Association } from "@/models/interfaces/Association";
import { i18n } from "@/plugins/i18n";
import { toTypedSchema } from "@vee-validate/zod";
import { useField, useForm } from "vee-validate";
import { computed } from "vue";
import z from "zod";
import { CommonFormService } from "../CommonFormService";

export class AssociationFormService {
    private static readonly validations = {
        nom: z
        .string()
        .min(1, { message: i18n.t('forms.errors.required') })
        .max(255, { message: i18n.t('forms.errors.maxLength', { max: 255 }) }),

        acronyme: z
        .string()
        .max(255, { message: i18n.t('forms.errors.maxLength', { max: 255 }) })
        .optional()
        .or(z.literal('')),

        desc: z
        .string()
        .min(1, { message: i18n.t('forms.errors.required') })
        .min(10, { message: i18n.t('forms.errors.minLength', { min: 10 }) }),

        type_org: z
        .nativeEnum(AssociationType),

        type_org_autre: z
        .string()
        .optional()
        .nullable()
        .or(z.literal('')),

        annee_creation: z
        .number({ message: i18n.t('forms.errors.required') })
        .min(1900, { message: i18n.t('forms.errors.minValue', { min: 1900 }) })
        .max(new Date().getFullYear(), { 
            message: i18n.t('forms.errors.maxValue', { max: new Date().getFullYear() }) 
        }),

        secteurs_interv: z.array(z.nativeEnum(AssociationInterventionSector))
        .min(1, { message: i18n.t('forms.errors.required') }),

        secteurs_interv_autre: z.string()
        .optional()
        .nullable()
        .or(z.literal('')),

        province: z
        .string()
        .min(1, { message: i18n.t('forms.errors.required') }),

        territoire: z
        .string()
        .min(1, { message: i18n.t('forms.errors.required') }),

        zone_sante: z
        .string()
        .min(1, { message: i18n.t('forms.errors.required') }),

        aire_sante: z
        .string()
        .min(1, { message: i18n.t('forms.errors.required') }),

        localite: z
        .string()
        .min(1, { message: i18n.t('forms.errors.required') }),

        latitude: z
        .number({ message: i18n.t('forms.errors.required') })
        .min(-90, { message: i18n.t('forms.errors.invalidLatitude') })
        .max(90, { message: i18n.t('forms.errors.invalidLatitude') }),

        longitude: z
        .number({ message: i18n.t('forms.errors.required') })
        .min(-180, { message: i18n.t('forms.errors.invalidLongitude') })
        .max(180, { message: i18n.t('forms.errors.invalidLongitude') }),

        altitude: z
        .number()
        .optional()
        .nullable(),

        precision: z
        .number()
        .optional()
        .nullable(),

        budget_2022: z
        .number()
        .min(0, { message: i18n.t('forms.errors.positiveNumber') })
        .optional()
        .nullable(),

        budget_2023: z
        .number()
        .min(0, { message: i18n.t('forms.errors.positiveNumber') })
        .optional()
        .nullable(),

        budget_2024: z
        .number()
        .min(0, { message: i18n.t('forms.errors.positiveNumber') })
        .optional()
        .nullable(),

        nb_salaries: z
        .number({ message: i18n.t('forms.errors.required') })
        .min(0, { message: i18n.t('forms.errors.positiveNumber') })
        .max(32767, { message: i18n.t('forms.errors.maxValue', { max: 32767 }) }),

        nb_benevoles: z
        .number({ message: i18n.t('forms.errors.required') })
        .min(0, { message: i18n.t('forms.errors.positiveNumber') })
        .max(32767, { message: i18n.t('forms.errors.maxValue', { max: 32767 }) }),

        nom_resp_edition: z
        .string()
        .min(1, { message: i18n.t('forms.errors.required') })
        .max(255, { message: i18n.t('forms.errors.maxLength', { max: 255 }) }),

        email_resp_edition: z
        .string()
        .min(1, { message: i18n.t('forms.errors.required') })
        .email({ message: i18n.t('forms.errors.email') })
        .refine(
            (email) => !email || CommonFormService.validateEmail(email),
            { message: i18n.t('forms.errors.emailValid') }
        ),

        email_org: z
        .string()
        .min(1, { message: i18n.t('forms.errors.required') })
        .email({ message: i18n.t('forms.errors.email') })
        .refine(
            (email) => !email || CommonFormService.validateEmail(email),
            { message: i18n.t('forms.errors.emailValid') }
        ),

        nom_contact: z
        .string()
        .min(1, { message: i18n.t('forms.errors.required') })
        .max(255, { message: i18n.t('forms.errors.maxLength', { max: 255 }) }),

        tel_contact: z
        .string()
        .min(1, { message: i18n.t('forms.errors.required') })
        .regex(/^[\+]?[0-9\s\-\(\)]{8,20}$/, { 
            message: i18n.t('forms.errors.invalidPhone') 
        }),

        email_contact: z
        .string()
        .min(1, { message: i18n.t('forms.errors.required') })
        .email({ message: i18n.t('forms.errors.email') })
        .refine(
            (email) => !email || CommonFormService.validateEmail(email),
            { message: i18n.t('forms.errors.emailValid') }
        ),

        website: z
        .string()
        .url({ message: i18n.t('forms.errors.invalidUrl') })
        .nullable()
        .or(z.literal('')),

        facebook: z
        .string()
        .url({ message: i18n.t('forms.errors.invalidUrl') })
        .nullable()
        .or(z.literal('')),

        twitter: z
        .string()
        .url({ message: i18n.t('forms.errors.invalidUrl') })
        .nullable()
        .or(z.literal('')),

        instagram: z
        .string()
        .url({ message: i18n.t('forms.errors.invalidUrl') })
        .nullable()
        .or(z.literal('')),

        linkedin: z
        .string()
        .url({ message: i18n.t('forms.errors.invalidUrl') })
        .nullable()
        .or(z.literal('')),

        tiktok: z
        .string()
        .url({ message: i18n.t('forms.errors.invalidUrl') })
        .nullable()
        .or(z.literal('')),

        autre_social_media: z
        .string()
        .nullable()
        .or(z.literal(''))
    }
    static getAssociationForm(associationToEdit: Association | null){
        const validationSchema = toTypedSchema(
            z.object(this.validations)
                .refine(
                    (data) => {
                        if (data.type_org === AssociationType.OTHER) {
                            return data.type_org_autre && data.type_org_autre.trim() !== ''
                        }
                        return true
                    },
                    {
                        message: i18n.t('forms.errors.required'),
                        path: ['type_org_autre']
                    }
                )
                .refine(
                    (data) => {
                        if (data.secteurs_interv.includes( AssociationInterventionSector.OTHER)) {
                            return data.secteurs_interv_autre && data.secteurs_interv_autre.trim() !== ''
                        }
                        return true
                    },
                    {
                        message: i18n.t('forms.errors.required'),
                        path: ['secteurs_interv_autre']
                    }
                )
        )

        const { errors, handleSubmit, isSubmitting, meta } = useForm<Association>({
            initialValues: associationToEdit,
            validationSchema: validationSchema
        })

        const form = {
            nom: useField<string>('nom', '', { validateOnValueUpdate: true }),
            acronyme: useField<string>('acronyme', '', { validateOnValueUpdate: true }),
            desc: useField<string>('desc', '', { validateOnValueUpdate: true }),
            type_org: useField<string>('type_org', '', { validateOnValueUpdate: true }),
            type_org_autre: useField<string>('type_org_autre', '', { validateOnValueUpdate: true }),
            annee_creation: useField<number>('annee_creation', '', { validateOnValueUpdate: true }),
            secteurs_interv: useField<string[]>('secteurs_interv', [], { validateOnValueUpdate: true }),
            secteurs_interv_autre: useField<string[]>('secteurs_interv_autre', '', { validateOnValueUpdate: true }),
            province: useField<string>('province', '', { validateOnValueUpdate: true }),
            territoire: useField<string>('territoire', '', { validateOnValueUpdate: true }),
            zone_sante: useField<string>('zone_sante', '', { validateOnValueUpdate: true }),
            aire_sante: useField<string>('aire_sante', '', { validateOnValueUpdate: true }),
            localite: useField<string>('localite', '', { validateOnValueUpdate: true }),
            latitude: useField<number>('latitude', '', { validateOnValueUpdate: true }),
            longitude: useField<number>('longitude', '', { validateOnValueUpdate: true }),
            altitude: useField<number | null>('altitude', '', { validateOnValueUpdate: true }),
            precision: useField<number | null>('precision', '', { validateOnValueUpdate: true }),
            budget_2022: useField<number | null>('budget_2022', '', { validateOnValueUpdate: true }),
            budget_2023: useField<number | null>('budget_2023', '', { validateOnValueUpdate: true }),
            budget_2024: useField<number | null>('budget_2024', '', { validateOnValueUpdate: true }),
            nb_salaries: useField<number>('nb_salaries', '', { validateOnValueUpdate: true }),
            nb_benevoles: useField<number>('nb_benevoles', '', { validateOnValueUpdate: true }),
            nom_resp_edition: useField<string>('nom_resp_edition', '', { validateOnValueUpdate: true }),
            email_resp_edition: useField<string>('email_resp_edition', '', { validateOnValueUpdate: true }),
            email_org: useField<string>('email_org', '', { validateOnValueUpdate: true }),
            nom_contact: useField<string>('nom_contact', '', { validateOnValueUpdate: true }),
            tel_contact: useField<string>('tel_contact', '', { validateOnValueUpdate: true }),
            email_contact: useField<string>('email_contact', '', { validateOnValueUpdate: true }),
            website: useField<string>('website', '', { validateOnValueUpdate: true }),
            facebook: useField<string>('facebook', '', { validateOnValueUpdate: true }),
            twitter: useField<string>('twitter', '', { validateOnValueUpdate: true }),
            instagram: useField<string>('instagram', '', { validateOnValueUpdate: true }),
            linkedin: useField<string>('linkedin', '', { validateOnValueUpdate: true }),
            tiktok: useField<string>('tiktok', '', { validateOnValueUpdate: true }),
            autre_social_media: useField<string>('autre_social_media', '', { validateOnValueUpdate: true })
        }

        const isValid = computed(() => meta.value.valid)

        return { form, errors, handleSubmit, isSubmitting, isValid }
    }
}