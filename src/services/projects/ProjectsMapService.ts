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
            if (project.zone_sante) {
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
            return this.adminBoundariesStore.healthZonesList.find(hz => hz.zone_sante === zone && project.territoire.includes(hz.territoire));
        }).filter(hz => hz !== undefined);

        return healthZones.map((hz: HealthZone) => {
            return {
                type: 'Feature',
                properties: {...project},
                geometry: {
                    type: 'Point',
                    coordinates: ([hz.centroid.coordinates[0], hz.centroid.coordinates[1]] as [number, number])
                }
            }
        })
    }

    private static getTerritoriesFeatures(project: Project) {
        const territories = project.territoire.map(territoire => {
            return this.adminBoundariesStore.territoriesList.find(t => t.territoire === territoire && project.province.includes(t.province));
        }).filter(hz => hz !== undefined);

        return territories.map((t: Territory) => {
            return {
                type: 'Feature',
                properties: {...project},
                geometry: {
                    type: 'Point',
                    coordinates: ([t.centroid.coordinates[0], t.centroid.coordinates[1]] as [number, number])
                }
            }
        })
    }

    private static getProvincesFeatures(project: Project) {
        const provinces = project.province.map(province => {
            return this.adminBoundariesStore.provincesList.find(p => p.province === province);
        }).filter(hz => hz !== undefined);

        return provinces.map((p: Province) => {
            return {
                type: 'Feature',
                properties: {...project},
                geometry: {
                    type: 'Point',
                    coordinates: ([p.centroid.coordinates[0], p.centroid.coordinates[1]] as [number, number])
                }
            }
        })
    }
}