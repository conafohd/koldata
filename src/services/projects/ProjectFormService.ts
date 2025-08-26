import { InterventionSector } from "@/models/enums/InterventionSector";
import { ProjectBeneficiaryType } from "@/models/enums/projects/ProjectBeneficiaryType";
import { ProjectFunder } from "@/models/enums/projects/ProjectFunder";
import { ProjectServiceType } from "@/models/enums/projects/ProjectServiceType";
import { ProjectStatus } from "@/models/enums/projects/ProjectStatus";
import type { Project } from "@/models/interfaces/Project";
import { i18n } from "@/plugins/i18n";
import { toTypedSchema } from "@vee-validate/zod";
import { useField, useForm } from "vee-validate";
import { computed } from "vue";
import z from "zod";
import { PROJECT_SERVICES_BY_SECTOR } from "../utils/ProjectServiceList";

export class ProjectFormService {
    private static readonly validations = {
        intitule_projet: z
        .string( { message: i18n.t('forms.errors.required') })
        .min(1, { message: i18n.t('forms.errors.required') })
        .max(255, { message: i18n.t('forms.errors.maxLength', { max: 255 }) }),

        partenaire_financier_technique: z
        .string( { message: i18n.t('forms.errors.required') })
        .min(1, { message: i18n.t('forms.errors.required') })
        .max(255, { message: i18n.t('forms.errors.maxLength', { max: 255 }) }),

        noms_bailleurs_fonds: z.array(z.nativeEnum(ProjectFunder), {
            message: i18n.t('forms.errors.required')
        })
        .min(1, { message: i18n.t('forms.errors.required') }),

        autre_bailleur_fonds: z
        .string( { message: i18n.t('forms.errors.required') })
        .optional()
        .nullable()
        .or(z.literal('')),

        secteurs_intervention: z.array(z.nativeEnum(InterventionSector), {
            message: i18n.t('forms.errors.required')
        })
        .min(1, { message: i18n.t('forms.errors.required') }),

        autre_secteur_intervention: z
        .string( { message: i18n.t('forms.errors.required') })
        .optional()
        .nullable()
        .or(z.literal('')),

        date_debut_projet: z
        .string( { message: i18n.t('forms.errors.required') })
        .min(1, { message: i18n.t('forms.errors.required') }),

        date_fin_projet: z
        .string()
        .min(1, { message: i18n.t('forms.errors.required') })
        .optional()
        .nullable(),

        statut_projet: z
        .nativeEnum(ProjectStatus)
        .optional()
        .nullable(),

        province: z.array(z.string(), {
            message: i18n.t('forms.errors.required')
        })
        .min(1, { message: i18n.t('forms.errors.required') }),

        territoire: z.array(z.string(), {
            message: i18n.t('forms.errors.required')
        })
        .min(1, { message: i18n.t('forms.errors.required') }),

        zone_sante: z.array(z.string(), {
            message: i18n.t('forms.errors.required')
        })
        .min(1, { message: i18n.t('forms.errors.required') }),

        aire_sante: z
        .string({ message: i18n.t('forms.errors.required') } )
        .min(1, { message: i18n.t('forms.errors.required') }),

        localite_village_quartier: z
        .string({ message: i18n.t('forms.errors.required') })
        .min(1, { message: i18n.t('forms.errors.required') }),

        budget_projet: z
        .number({ message: i18n.t('forms.errors.required') })
        .min(0, { message: i18n.t('forms.errors.positiveNumber') }),

        types_services_fournis: z.array(z.nativeEnum(ProjectServiceType), {
            message: i18n.t('forms.errors.required')
        })
        .min(1, { message: i18n.t('forms.errors.required') }),

        autre_type_services_fournis: z
        .string({ message: i18n.t('forms.errors.required') })
        .optional()
        .nullable()
        .or(z.literal('')),

        types_beneficiaires_populations_cibles: z.array(z.nativeEnum(ProjectBeneficiaryType), {
            message: i18n.t('forms.errors.required')
        })
        .min(1, { message: i18n.t('forms.errors.required') }),

        autre_types_beneficiaires_populations_cibles: z
        .string({ message: i18n.t('forms.errors.required') })
        .optional()
        .nullable()
        .or(z.literal('')),

        nombre_total_personnes_cibles: z
        .number({ message: i18n.t('forms.errors.required') })
        .min(0, { message: i18n.t('forms.errors.positiveNumber') })
        .max(2147483647, { message: i18n.t('forms.errors.maxValue', { max: 2147483647 }) }),

        nombre_hommes: z
        .number()
        .min(0, { message: i18n.t('forms.errors.positiveNumber') })
        .max(2147483647, { message: i18n.t('forms.errors.maxValue', { max: 2147483647 }) })
        .optional()
        .nullable(),

        nombre_femmes: z
        .number()
        .min(0, { message: i18n.t('forms.errors.positiveNumber') })
        .max(2147483647, { message: i18n.t('forms.errors.maxValue', { max: 2147483647 }) })
        .optional()
        .nullable(),

        nombre_filles: z
        .number()
        .min(0, { message: i18n.t('forms.errors.positiveNumber') })
        .max(2147483647, { message: i18n.t('forms.errors.maxValue', { max: 2147483647 }) })
        .optional()
        .nullable(),

        nombre_garcons: z
        .number()
        .min(0, { message: i18n.t('forms.errors.positiveNumber') })
        .max(2147483647, { message: i18n.t('forms.errors.maxValue', { max: 2147483647 }) })
        .optional()
        .nullable(),

        nombre_personnes_atteintes: z
        .number()
        .min(0, { message: i18n.t('forms.errors.positiveNumber') })
        .max(2147483647, { message: i18n.t('forms.errors.maxValue', { max: 2147483647 }) })
        .optional()
        .nullable(),

        nombre_personnes_handicapees: z
        .number()
        .min(0, { message: i18n.t('forms.errors.positiveNumber') })
        .max(2147483647, { message: i18n.t('forms.errors.maxValue', { max: 2147483647 }) })
        .optional()
        .nullable(),

        nombre_personnes_agees: z
        .number()
        .min(0, { message: i18n.t('forms.errors.positiveNumber') })
        .max(2147483647, { message: i18n.t('forms.errors.maxValue', { max: 2147483647 }) })
        .optional()
        .nullable(),

        consortium: z
        .boolean()
        .nullable(),

        partenaires_consortium: z
        .string({ message: i18n.t('forms.errors.required') })
        .optional()
        .nullable()
        .or(z.literal(''))
    }

    static getProjectForm(projectToEdit: Project | null) {
        const validationSchema = toTypedSchema(
            z.object(this.validations)
                .refine(
                    (data) => {
                        if (data.noms_bailleurs_fonds.includes(ProjectFunder.OTHER)) {
                            return data.autre_bailleur_fonds && data.autre_bailleur_fonds.trim() !== ''
                        }
                        return true
                    },
                    {
                        message: i18n.t('forms.errors.required'),
                        path: ['autre_bailleur_fonds']
                    }
                )
                .refine(
                    (data) => {
                        if (data.secteurs_intervention.includes(InterventionSector.OTHER)) {
                            return data.autre_secteur_intervention && data.autre_secteur_intervention.trim() !== ''
                        }
                        return true
                    },
                    {
                        message: i18n.t('forms.errors.required'),
                        path: ['autre_secteur_intervention']
                    }
                )
                .refine(
                    (data) => {
                        if (data.types_services_fournis.includes(ProjectServiceType.OTHER)) {
                            return data.autre_type_services_fournis && data.autre_type_services_fournis.trim() !== ''
                        }
                        return true
                    },
                    {
                        message: i18n.t('forms.errors.required'),
                        path: ['autre_type_services_fournis']
                    }
                )
                .refine(
                    (data) => {
                        if (data.types_beneficiaires_populations_cibles.includes(ProjectBeneficiaryType.OTHER)) {
                            return data.autre_types_beneficiaires_populations_cibles && data.autre_types_beneficiaires_populations_cibles.trim() !== ''
                        }
                        return true
                    },
                    {
                        message: i18n.t('forms.errors.required'),
                        path: ['autre_types_beneficiaires_populations_cibles']
                    }
                )
                .refine(
                    (data) => {
                        if (data.date_debut_projet && data.date_fin_projet) {
                            return new Date(data.date_debut_projet) <= new Date(data.date_fin_projet)
                        }
                        return true
                    },
                    {
                        message: i18n.t('forms.errors.dateRange'),
                        path: ['date_fin_projet']
                    }
                )
                .refine(
                    (data) => {
                        if (data.consortium) {
                            return data.partenaires_consortium && data.partenaires_consortium.trim() !== ''
                        }
                        return true
                    },
                    {
                        message: i18n.t('forms.errors.required'),
                        path: ['partenaires_consortium']
                    }
                )
        )

        const { errors, handleSubmit, isSubmitting, meta } = useForm<Project>({
            initialValues: projectToEdit,
            validationSchema: validationSchema
        })

        const form = {
            intitule_projet: useField<string>('intitule_projet', '', { validateOnValueUpdate: true }),
            partenaire_financier_technique: useField<string>('partenaire_financier_technique', '', { validateOnValueUpdate: true }),
            noms_bailleurs_fonds: useField<string[]>('noms_bailleurs_fonds', [], { validateOnValueUpdate: true }),
            autre_bailleur_fonds: useField<string>('autre_bailleur_fonds', '', { validateOnValueUpdate: true }),
            secteurs_intervention: useField<string[]>('secteurs_intervention', [], { validateOnValueUpdate: true }),
            autre_secteur_intervention: useField<string>('autre_secteur_intervention', '', { validateOnValueUpdate: true }),
            date_debut_projet: useField<string | null>('date_debut_projet', '', { validateOnValueUpdate: true }),
            date_fin_projet: useField<string | null>('date_fin_projet', '', { validateOnValueUpdate: true }),
            statut_projet: useField<string | null>('statut_projet', '', { validateOnValueUpdate: true }),
            province: useField<string[]>('province', [], { validateOnValueUpdate: true }),
            territoire: useField<string[]>('territoire', [], { validateOnValueUpdate: true }),
            zone_sante: useField<string[]>('zone_sante', [], { validateOnValueUpdate: true }),
            aire_sante: useField<string>('aire_sante', '', { validateOnValueUpdate: true }),
            localite_village_quartier: useField<string>('localite_village_quartier', '', { validateOnValueUpdate: true }),
            budget_projet: useField<number>('budget_projet', '', { validateOnValueUpdate: true }),
            types_services_fournis: useField<string[]>('types_services_fournis', [], { validateOnValueUpdate: true }),
            autre_type_services_fournis: useField<string>('autre_type_services_fournis', '', { validateOnValueUpdate: true }),
            types_beneficiaires_populations_cibles: useField<string[]>('types_beneficiaires_populations_cibles', [], { validateOnValueUpdate: true }),
            autre_types_beneficiaires_populations_cibles: useField<string>('autre_types_beneficiaires_populations_cibles', '', { validateOnValueUpdate: true }),
            nombre_total_personnes_cibles: useField<number>('nombre_total_personnes_cibles', '', { validateOnValueUpdate: true }),
            nombre_hommes: useField<number | null>('nombre_hommes', '', { validateOnValueUpdate: true }),
            nombre_femmes: useField<number | null>('nombre_femmes', '', { validateOnValueUpdate: true }),
            nombre_filles: useField<number | null>('nombre_filles', '', { validateOnValueUpdate: true }),
            nombre_garcons: useField<number | null>('nombre_garcons', '', { validateOnValueUpdate: true }),
            nombre_personnes_atteintes: useField<number | null>('nombre_personnes_atteintes', '', { validateOnValueUpdate: true }),
            nombre_personnes_handicapees: useField<number | null>('nombre_personnes_handicapees', '', { validateOnValueUpdate: true }),
            nombre_personnes_agees: useField<number | null>('nombre_personnes_agees', '', { validateOnValueUpdate: true }),
            consortium: useField<boolean>('consortium', '', { validateOnValueUpdate: true }),
            partenaires_consortium: useField<string | null>('partenaires_consortium', '', { validateOnValueUpdate: true })
        }

        const isValid = computed(() => meta.value.valid)

        return { form, errors, handleSubmit, isSubmitting, isValid }
    }

    public static getProjectServiceTypesForSector(sectors: InterventionSector[]): ProjectServiceType[] {
        if (!sectors || sectors.length === 0) {
            return [];
        }
        return [...new Set(
            sectors.flatMap(sector => PROJECT_SERVICES_BY_SECTOR[sector] || [])
        )];
    }
}
