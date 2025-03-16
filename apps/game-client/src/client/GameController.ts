setScene(sceneID: number): void {
    console.log("%c[GameController] Setting scene to: " + sceneID, "color: purple; font-weight: bold");
    this.nextScene = sceneID;
} 