export default class Popover {
    constructor(buttonId, popoverId) {
        this.button = document.getElementById(buttonId);
        this.popover = document.getElementById(popoverId);
        if (!this.button || !this.popover) {
            console.error('Popover button or popover element not found');
            return;
        }

        this.popover.style.display = 'none';
        this.init();
    }

    init() {
        this.button.addEventListener('click', (event) => {
            event.stopPropagation();
            this.togglePopover();
        });

        window.addEventListener('resize', () => this.positionPopover());
        window.addEventListener('scroll', () => this.positionPopover());
        document.addEventListener('click', (event) => this.handleOutsideClick(event));
    }

    togglePopover() {
        this.popover.classList.toggle('visible');
        console.log('Popover visibility toggled:', this.popover.classList.contains('visible')); // Отладка
        if (this.popover.classList.contains('visible')) {
            this.positionPopover();
        }
    }

    positionPopover() {
        const rect = this.button.getBoundingClientRect();
        const popoverHeight = this.popover.offsetHeight;
        const popoverWidth = this.popover.offsetWidth;
        const scrollTop = window.scrollY;

        this.popover.style.left = `${rect.left + rect.width / 2 - popoverWidth / 2}px`;
        this.popover.style.top = `${rect.top + scrollTop - popoverHeight - 17}px`;
    }

    handleOutsideClick(event) {
        if (this.button !== event.target && !this.popover.contains(event.target)) {
            this.popover.classList.remove('visible');
        }
    }
}
