import type { HealthZone, Province, Territory } from "@/models/interfaces/AdminBoundaries";
import type { Project } from "@/models/interfaces/Project";
import { useAdminBoundariesStore } from "@/stores/adminBoundariesStore";

export class ProjectsMapService {
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

    public static getProjectCentroid(project: Project): [number, number] {
        const adminBoundariesStore = useAdminBoundariesStore();
        const DRC_CENTER: [number, number] = [21.7587, -4.0383]
        // IF project has several admin boundaries, return the centroid of all of them
        const coords: [number, number][] = [];
        if (project.zone_sante && project.zone_sante.length > 0) {
            project.zone_sante.forEach(zone => {
                const hz = adminBoundariesStore.healthZonesList.find(hz => hz.zone_sante_c === zone);
                if (hz) {
                    coords.push(hz.centroid.coordinates);
                }
            });
        }
        if (project.territoire && project.territoire.length > 0) {
            project.territoire.forEach(territoire => {
                const t = adminBoundariesStore.territoriesList.find(t => t.territoire_c === territoire);
                if (t) {
                    coords.push(t.centroid.coordinates);
                }
            });
        }
        if (project.province && project.province.length > 0) {
            project.province.forEach(province => {
                const p = adminBoundariesStore.provincesList.find(p => p.province_c === province);
                if (p) {
                    coords.push(p.centroid.coordinates);
                }
            });
        }
        if (coords.length > 0) {
            const avgLng = coords.reduce((sum, c) => sum + c[0], 0) / coords.length;
            const avgLat = coords.reduce((sum, c) => sum + c[1], 0) / coords.length;
            return [avgLng, avgLat];
        }
        return DRC_CENTER;
    }

    private static getHealthZonesFeatures(project: Project) {
        const adminBoundariesStore = useAdminBoundariesStore();
        const healthZones = project.zone_sante.map(zone => {
            return adminBoundariesStore.healthZonesList.find(hz => hz.zone_sante_c === zone );
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
        const adminBoundariesStore = useAdminBoundariesStore();
        const territories = project.territoire.map(territoire => {
            return adminBoundariesStore.territoriesList.find(t => t.territoire_c === territoire);
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
        const adminBoundariesStore = useAdminBoundariesStore();
        const provinces = project.province.map(province => {
            return adminBoundariesStore.provincesList.find(p => p.province_c === province);
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