import { AngorDrawerComponent } from '@angor/components/drawer/drawer.component';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AngorDrawerService {
    private _componentRegistry: Map<string, AngorDrawerComponent> = new Map<
        string,
        AngorDrawerComponent
    >();

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Register drawer component
     *
     * @param name
     * @param component
     */
    registerComponent(name: string, component: AngorDrawerComponent): void {
        this._componentRegistry.set(name, component);
    }

    /**
     * Deregister drawer component
     *
     * @param name
     */
    deregisterComponent(name: string): void {
        this._componentRegistry.delete(name);
    }

    /**
     * Get drawer component from the registry
     *
     * @param name
     */
    getComponent(name: string): AngorDrawerComponent | undefined {
        return this._componentRegistry.get(name);
    }
}
