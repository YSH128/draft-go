package org.springframework.messaging.simp;

import org.springframework.stereotype.Component;

@Component
public class SimpMessagingTemplate {
    public void convertAndSend(String destination, Object payload) {
        System.out.println("[MockWebSocket] Send to " + destination + ": " + payload);
    }
}
