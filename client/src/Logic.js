class Logic {
    static update() {
        PacketProcessor.processPackets();

        Camera.update();
        Environment.update();

        SnakeManager.update();
        if (SnakeManager.snakes[clientID]) {
            Camera.setPosition(SnakeManager.snakes[clientID].getRenderPosition());

            let scale = 3 / SnakeManager.snakes[clientID].getScale();
            scale = (scale - 1) * 0.8 + 1;
            Camera.setScale(new Vec2(scale, scale));
        }

        FoodManager.update();
        ExitAnimations.update();

        BoostManager.update();

        TitleManager.update();

        ClientInput.update();

        Packets.sendPackets();
    }
}