import type { Map } from "maplibre-gl"

export class MapService {
    public static addCursorPointerOnHover(layerNames: string[], map: Map | undefined) {
        map?.on('mouseenter', layerNames, () => {
            if (map) map.getCanvas().style.cursor = 'pointer'
        })
        map?.on('mouseleave', layerNames, () => {
            if (map) map.getCanvas().style.cursor = ''
        })
    }
}