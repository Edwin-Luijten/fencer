import mapboxgl, { IControl } from 'mapbox-gl';

const searchIconSVG = '<path d="M7.4 2.5c-2.7 0-4.9 2.2-4.9 4.9s2.2 4.9 4.9 4.9c1 0 1.8-.2 2.5-.8l3.7 3.7c.2.2.4.3.8.3.7 0 1.1-.4 1.1-1.1 0-.3-.1-.5-.3-.8L11.4 10c.4-.8.8-1.6.8-2.5.1-2.8-2.1-5-4.8-5zm0 1.6c1.8 0 3.2 1.4 3.2 3.2s-1.4 3.2-3.2 3.2-3.3-1.3-3.3-3.1 1.4-3.3 3.3-3.3z"/>';
const openIconSVG = '<path fill-rule="evenodd" clip-rule="evenodd" d="M7.549 3.341A1 1 0 006.796 3H3a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1V6a1 1 0 00-1-1H9.454a1 1 0 01-.753-.341L7.55 3.341zM15 6.5H3V8h12V6.5z"></path>';
const settingsIconSVG = '<path fill-rule="evenodd" clip-rule="evenodd" d="M4.634 3.438l1.732-1L7.981 4h2.038l1.615-1.562 1.732 1-.55 2.195.85 1.7L16 8v2l-2.333.667-.85 1.7.549 2.195-1.732 1L10.019 14H7.981l-1.615 1.562-1.732-1 .55-2.195-.85-1.7L2 10V8l2.333-.667.85-1.7-.549-2.195zM9 11a2 2 0 100-4 2 2 0 000 4z"></path>';
const questionMarkIconSVG = '<path fill-rule="evenodd" clip-rule="evenodd" d="M9 16A7 7 0 109 2a7 7 0 000 14zM6.881 4.881a2.582 2.582 0 011.826-.756h1.086a2.582 2.582 0 012.582 2.582v.16c0 1.01-.53 1.946-1.396 2.466l-.558.335c-.266.16-.451.42-.518.716-.03.135-.14.248-.278.248h-1.25a.234.234 0 01-.24-.25c.08-.912.592-1.738 1.386-2.215l.558-.335c.339-.203.546-.57.546-.964v-.16a.832.832 0 00-.832-.833H8.707a.832.832 0 00-.832.832v.182a.875.875 0 11-1.75 0v-.182c0-.685.272-1.341.756-1.826zM10 13a1 1 0 11-2 0 1 1 0 012 0z"></path>';

export type EditorControlOptions = {
    settingsCallback?: () => void;
    openCallback?: () => void;
    searchCallback?: () => void;
    faqCallback?: () => void;
}

export class EditorControl implements IControl {
    private map?: mapboxgl.Map;
    private readonly controlGroup: HTMLElementTagNameMap['div'];

    constructor(private options: EditorControlOptions) {
        this.controlGroup = document.createElement('div');
    }

    onAdd(map: mapboxgl.Map) {
        this.map = map;

        this.controlGroup.classList.add('mapboxgl-ctrl-group', 'mapboxgl-ctrl');

        this.createControlButton('open', {
            className: 'open',
            title: 'Open',
            icon: this.createIcon('open', openIconSVG),
            onClick: this.options.openCallback,
        });

        this.createControlButton('search', {
            className: 'search',
            title: 'Search',
            icon: this.createIcon('search', searchIconSVG),
            onClick: this.options.searchCallback,
        });

        this.createControlButton('settings', {
            className: 'settings',
            title: 'Settings',
            icon: this.createIcon('settings', settingsIconSVG),
            onClick: this.options.settingsCallback,
        });

        this.createControlButton('help', {
            className: 'help',
            title: 'Help',
            icon: this.createIcon('help', questionMarkIconSVG),
            onClick: this.options.faqCallback,
        });

        return this.controlGroup;
    }

    onRemove(map: mapboxgl.Map) {
        this.controlGroup.parentNode.removeChild(this.controlGroup);
        this.map = undefined;
    }

    private createControlButton(id: string, options = {} as { className: string; title: string; icon?: SVGSVGElementEventMap['svg']; onClick?: () => void; }) {
        if (!options.onClick) return;

        const button = document.createElement('button');
        button.className = `editor-ctrl ${options.className}`;
        button.setAttribute('title', options.title);

        if (options.icon) button.appendChild(options.icon);
        this.controlGroup.appendChild(button);

        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (options.onClick) {
                options.onClick();
            }

        }, true);

        return button;
    }

    private createIcon(name: string, path: string): SVGSVGElementEventMap['svg'] {
        const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        icon.setAttribute('class', 'mapboxgl-ctrl-icon mapboxgl-ctrl-icon-' + name);
        icon.setAttribute('viewBox', '0 0 18 18');
        icon.setAttribute('xml:space', 'preserve');
        icon.setAttribute('width', '' + 18);
        icon.setAttribute('height', '' + 18);
        icon.innerHTML = path;
        return icon;
    }
}