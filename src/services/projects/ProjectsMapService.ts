import type { HealthZone, Province, Territory } from "@/models/interfaces/AdminBoundaries";
import type { Project } from "@/models/interfaces/Project";
import { useAdminBoundariesStore } from "@/stores/adminBoundariesStore";

export class ProjectsMapService {
    private static adminBoundariesStore = useAdminBoundariesStore();
    public static getProjectsGeoJson(projects: Project[]) {
        const geojson: {
            type: string;
            features: {
                type: string;
                properties: Project;
                geometry: {
                    type: string;
                    coordinates: [number, number];
                };
            }[];
        } = {
            type: 'FeatureCollection',
            features: []
        };

        projects.forEach(project => {
            if (project.zone_sante && project.zone_sante.length > 0) {
                geojson.features.push(...this.getHealthZonesFeatures(project));
                return;
            }
            if (project.territoire) {
                geojson.features.push(...this.getTerritoriesFeatures(project));
                return;
            }
            if (project.province) {
                geojson.features.push(...this.getProvincesFeatures(project));
                return;
            }
        });
        return geojson;
    }

    private static getHealthZonesFeatures(project: Project) {
        const healthZones = project.zone_sante.map(zone => {
            return this.adminBoundariesStore.healthZonesList.find(hz => hz.zone_sante_c === zone );
        }).filter(hz => hz !== undefined);

        return healthZones.map((hz: HealthZone) => {
            return {
                type: 'Feature',
                properties: {...project},
                geometry: hz.centroid
            }
        })
    }

    private static getTerritoriesFeatures(project: Project) {
        const territories = project.territoire.map(territoire => {
            return this.adminBoundariesStore.territoriesList.find(t => t.territoire_c === territoire);
        }).filter(hz => hz !== undefined);

        return territories.map((t: Territory) => {
            return {
                type: 'Feature',
                properties: {...project},
                geometry: t.centroid
            }
        })
    }

    private static getProvincesFeatures(project: Project) {
        const provinces = project.province.map(province => {
            return this.adminBoundariesStore.provincesList.find(p => p.province_c === province);
        }).filter(hz => hz !== undefined);

        return provinces.map((p: Province) => {
            return {
                type: 'Feature',
                properties: {...project},
                geometry: p.centroid
            }
        })
    }
}