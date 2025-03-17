declare module "../../shared/Libs/yuka-min" {
    export class NavMesh {
        regions: any[];
        load(url: string, options?: any): Promise<NavMesh>;
    }
    
    export class NavMeshLoader {
        load(url: string, options?: any): Promise<NavMesh>;
    }
    
    export class Vector3 {
        x: number;
        y: number;
        z: number;
        constructor(x?: number, y?: number, z?: number);
    }
} 