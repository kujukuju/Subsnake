class Logic {
    static update() {
        PacketProcessor.processPackets();

        Camera.update();
        Environment.update();

        SnakeManager.update();
        if (SnakeManager.snakes[clientID]) {
            Camera.setPositionFloat(SnakeManager.snakes[clientID].getRenderPosition());

            let scale = 3 / SnakeManager.snakes[clientID].getScale();
            scale = (scale - 1) * 0.6 + 1.2;
            Camera.setScale(new Vec2(scale, scale));
        }

        MobileInputProcessorSystem.update();

        KillPoints.update();
        ScoreBoxManager.update();

        FoodManager.update();
        ExitAnimations.update();

        BoostManager.update();

        TitleManager.update();

        ClientInput.update();

        Packets.sendPackets();
    }
}