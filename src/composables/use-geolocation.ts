import { onMounted, onUnmounted, ref } from 'vue';

export function useGeolocation() {
    const pos = ref({lat: 0, lng: 0});
    const isSupported = 'navigator' in window && 'geolocation' in navigator;

    let watcher = null;
    onMounted(() => {
        if (isSupported)
            watcher = navigator.geolocation.watchPosition(
                position => (pos.value = {lat: position.coords.latitude, lng: position.coords.longitude})
            );
    });

    onUnmounted(() => {
        if (watcher) navigator.geolocation.clearWatch(watcher);
    });

    return {pos, isSupported};
}