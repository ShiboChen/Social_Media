import Message from "./Message";
import MessageInput from "./MessageInput";
import { useEffect, useRef, useState } from "react";
import {
  conversationsAtom,
  selectedConversationAtom,
} from "../../atoms/messagesAtom.js";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { useQuery } from "@tanstack/react-query";
import { useSocket } from "../../context/SocketContext.jsx";
import { toast } from "react-hot-toast";
import messageSound from "../../assets/sounds/message.mp3";

const MessageContainer = () => {
  const selectedConversation = useRecoilValue(selectedConversationAtom);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [messages, setMessages] = useState([]);
  const { data: currentUser } = useQuery({ queryKey: ["authUser"] });
  const { socket } = useSocket();
  const setConversations = useSetRecoilState(conversationsAtom);
  const messageEndRef = useRef(null);

  useEffect(() => {
    socket.on("newMessage", (message) => {
      if (selectedConversation._id === message.conversationId) {
        setMessages((prev) => [...prev, message]);
      }

      // make a sound if the window is not focused
      if (!document.hasFocus()) {
        const sound = new Audio(messageSound);
        sound.play();
      }

      setConversations((prev) => {
        const updatedConversations = prev.map((conversation) => {
          if (conversation._id === message.conversationId) {
            return {
              ...conversation,
              lastMessage: {
                text: message.text,
                sender: message.sender,
              },
            };
          }
          return conversation;
        });
        return updatedConversations;
      });
    });

    return () => socket.off("newMessage");
  }, [socket, selectedConversation, setConversations]);

  useEffect(() => {
    const lastMessageIsFromOtherUser =
      messages.length &&
      messages[messages.length - 1].sender !== currentUser._id;
    if (lastMessageIsFromOtherUser) {
      socket.emit("markMessagesAsSeen", {
        conversationId: selectedConversation._id,
        userId: selectedConversation.userId,
      });
    }

    socket.on("messagesSeen", ({ conversationId }) => {
      if (selectedConversation._id === conversationId) {
        setMessages((prev) => {
          const updatedMessages = prev.map((message) => {
            if (!message.seen) {
              return {
                ...message,
                seen: true,
              };
            }
            return message;
          });
          return updatedMessages;
        });
      }
    });
  }, [socket, currentUser._id, messages, selectedConversation]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const getMessages = async () => {
      setLoadingMessages(true);
      setMessages([]);
      try {
        if (selectedConversation.mock) return;
        const res = await fetch(`/api/messages/${selectedConversation.userId}`);
        const data = await res.json();
        if (data.error) {
          toast.error(data.error);
          return;
        }
        setMessages(data);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoadingMessages(false);
      }
    };

    getMessages();
  }, [toast, selectedConversation.userId, selectedConversation.mock]);

  return (
    <div className="flex w-full bg-gray-200 rounded-md p-2 flex-col">
      {/* Message header */}
      <div className="flex w-full h-12 items-center gap-2">
        <div className="avatar">
          <div className="w-10 rounded-xl">
            <img src={selectedConversation.userProfileImg || '/avatar-placeholder.png'} />
          </div>
        </div>
        <span className="flex items-center text-xl text-white">
          {selectedConversation.username}{" "}
        </span>
      </div>

      <hr className="border-t border-gray-400 dark:border-gray-600 mt-2" />

      <div className="flex flex-col gap-4 my-4 p-2 flex-grow overflow-y-auto h-[500px]">
        {loadingMessages &&
          [...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`flex gap-2 items-center p-1 rounded-md self-${
                i % 2 === 0 ? "start" : "end"
              }`}
            >
              {i % 2 === 0 && <div className="w-7 h-7" />}
              <div className="flex flex-col gap-2">
                <div className="skeleton h-8 w-250"></div>
                <div className="skeleton h-8 w-250"></div>
                <div className="skeleton h-8 w-250"></div>
              </div>
              {i % 2 !== 0 && <div className="w-7 h-7" />}
            </div>
          ))}

        {!loadingMessages &&
          messages.map((message) => (
            <div
              key={message._id}
              ref={
                messages.length - 1 === messages.indexOf(message)
                  ? messageEndRef
                  : null
              }
            >
              <Message
                message={message}
                ownMessage={currentUser._id === message.sender}
              />
            </div>
          ))}
      </div>

      <MessageInput setMessages={setMessages} />
    </div>
  );
};

export default MessageContainer;
