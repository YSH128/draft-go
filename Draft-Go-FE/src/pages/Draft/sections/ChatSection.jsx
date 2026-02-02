import ChatSidebar from "../components/ChatSidebar";

export default function ChatSection({ messages, viewerCount, onSendMessage, myMemberId }) {
  return (
    <ChatSidebar
      messages={messages}
      viewerCount={viewerCount}
      onSendMessage={onSendMessage}
      myMemberId={myMemberId}
    />
  );
}
