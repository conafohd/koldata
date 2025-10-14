import type { Map } from "maplibre-gl"

export class MapService {
    public static addCursorPointerOnHover(layerNames: string[], map: Map | undefined) {
        layerNames.forEach(layerName => {
            map?.on('mouseenter', layerName, () => {
                if (map) {
                    map.getCanvas().style.cursor = 'pointer'
                }
            })
            map?.on('mouseleave', layerName, () => {
                if (map) {
                    map.getCanvas().style.cursor = ''
                }
            })
        })
    }
}