class Logic {
    static update() {
        PacketProcessor.processPackets();

        Camera.update();
        Environment.update();

        SnakeManager.update();
        if (SnakeManager.snakes[clientID]) {
            Camera.setPosition(SnakeManager.snakes[clientID].getRenderPosition());
        }

        ClientInput.update();

        Packets.sendPackets();

        // AudioManager.update();

        // GameState.update();

        // DeadBodyManager.update();

        // SoulPlantManager.update();

        // InterfaceManager.update();

        // OneLinerManager.update();

        // IntroLoreManager.update();

        // if (clientEntity) {
        //     clientEntity.sendPackets();
        // }

        // MoonPackets.sendPackets();
    }
}