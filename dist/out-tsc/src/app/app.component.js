import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
export let AppComponent = class AppComponent {
    constructor() {
        this.title = 'angular-boilerplate';
    }
};
AppComponent = __decorate([
    Component({
        selector: 'app-root',
        templateUrl: './app.component.html',
        styleUrls: ['./app.component.scss'],
        standalone: true,
        imports: [RouterOutlet],
    })
], AppComponent);
//# sourceMappingURL=app.component.js.map