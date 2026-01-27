import ChatSidebar from "../components/ChatSidebar";

export default function ChatSection({ messages, viewerCount, onSendMessage }) {
  return (
    <ChatSidebar
      messages={messages}
      viewerCount={viewerCount}
      onSendMessage={onSendMessage}
    />
  );
}
