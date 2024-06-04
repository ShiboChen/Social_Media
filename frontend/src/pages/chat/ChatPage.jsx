import React, { useEffect, useState } from "react";
import Conversation from "../../components/common/Conversation";
import MessageContainer from "../../components/common/MessageContainer";
import { useQuery } from "@tanstack/react-query";
import { GiConversation } from "react-icons/gi";
import { IoSearchSharp } from "react-icons/io5";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  conversationsAtom,
  selectedConversationAtom,
} from "../../atoms/messagesAtom";
import { toast } from "react-hot-toast";
import { useSocket } from "../../context/SocketContext";

const ChatPage = () => {
  const [searchingUser, setSearchingUser] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedConversation, setSelectedConversation] = useRecoilState(
    selectedConversationAtom
  );
  const [conversations, setConversations] = useRecoilState(conversationsAtom);
  const { data: currentUser } = useQuery({ queryKey: ["authUser"] });
  const { socket, onlineUsers } = useSocket();

  useEffect(() => {
    socket?.on("messagesSeen", ({ conversationId }) => {
      setConversations((prev) => {
        const updatedConversations = prev.map((conversation) => {
          if (conversation._id === conversationId) {
            return {
              ...conversation,
              lastMessage: {
                ...conversation.lastMessage,
                seen: true,
              },
            };
          }
          return conversation;
        });
        return updatedConversations;
      });
    });
  }, [socket, setConversations]);

  useEffect(() => {
    const getConversations = async () => {
      try {
        const res = await fetch("/api/messages/conversations");
        const data = await res.json();
        if (data.error) {
          toast.error(data.error);
          return;
        }
        setConversations(data);
      } catch (error) {
        toast.error(error.messager);
      } finally {
        setLoadingConversations(false);
      }
    };

    getConversations();
  }, [toast, setConversations]);

  const handleConversationSearch = async (e) => {
    e.preventDefault();
    setSearchingUser(true);
    try {
      const res = await fetch(`/api/users/profile/${searchText}`);
      const searchedUser = await res.json();
      if (searchedUser.error) {
        toast.error(searchedUser.error);
        return;
      }
      console.log(searchedUser);
      const messagingYourself = searchedUser._id === currentUser._id;
      if (messagingYourself) {
        toast.error("You cannot message yourself");
        return;
      }

      const conversationAlreadyExists = conversations.find(
        (conversation) => conversation.participants[0]._id === searchedUser._id
      );

      if (conversationAlreadyExists) {
        setSelectedConversation({
          _id: conversationAlreadyExists._id,
          userId: searchedUser._id,
          username: searchedUser.username,
          userProfileImg: searchedUser.profileImg,
        });
        return;
      }
      const mockConversation = {
        mock: true,
        lastMessage: {
          text: "",
          sender: "",
        },
        _id: Date.now(),
        participants: [
          {
            _id: searchedUser._id,
            username: searchedUser.username,
            profilePic: searchedUser.profilePic,
          },
        ],
      };
      setConversations((prevConvs) => [...prevConvs, mockConversation]);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSearchingUser(false);
    }
  };
  
  return (
    <>
      <div className="flex w-2/3 mr-auto border-r border-gray-700 min-h-screen">
        <div className="flex w-full border-b border-gray-700">
          {!selectedConversation._id ? (
            <div className="flex-1 flex flex-col items-center justify-center border rounded-md p-2">
              <GiConversation className="w-32 h-32 mb-4" />
              <p className="text-xl text-center">
                Select a conversation to start messaging
              </p>
            </div>
          ) : (
            <MessageContainer />
          )}
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4 mx-auto max-w-full sm:max-w-sm md:max-w-full px-4">
        <div className="flex flex-col gap-2 flex-1 max-w-full sm:max-w-xs md:max-w-full mx-auto">
          <p className="font-bold text-white-600 mt-2">Your Conversations</p>
          <form onSubmit={handleConversationSearch}>
            <div className="flex items-center gap-2">
              <input
                className="input rounded-md border-white"
                placeholder="Search for a user"
                onChange={(e) => setSearchText(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-sm rounded-md border-white"
                onClick={handleConversationSearch}
                disabled={searchingUser}
              >
                {/* <SearchIcon /> */}
                <IoSearchSharp className="w-6 h-6 outline-none" />
              </button>
            </div>
          </form>
          <div className="divider px-3"></div>

          {loadingConversations
            ? [0, 1, 2, 3, 4].map((_, i) => (
                <div key={i} className="flex gap-4 items-center p-1 rounded-md">
                  <div className="skeleton w-10 h-10 rounded-full shrink-0"></div>
                  <div className="flex flex-col gap-3 w-full">
                    <div className="skeleton h-2.5 w-20"></div>
                    <div className="skeleton h-2 w-11/12"></div>
                  </div>
                </div>
              ))
            : conversations.map((conversation) => (
                <Conversation
                  key={conversation._id}
                  isOnline={onlineUsers.includes(
                    conversation.participants[0]._id
                  )}
                  conversation={conversation}
                />
              ))}
        </div>
      </div>
    </>
  );
};

export default ChatPage;
