import { selectedConversationAtom } from "../../atoms/messagesAtom";
import { useRecoilValue } from "recoil";
import { useQuery } from "@tanstack/react-query";
import { BsCheck2All } from "react-icons/bs";
import { useState } from "react";

const Message = ({ ownMessage, message }) => {
  const selectedConversation = useRecoilValue(selectedConversationAtom);
  const { data: user } = useQuery({ queryKey: ["authUser"] });
  const [imgLoaded, setImgLoaded] = useState(false);
  return (
    <>
      {ownMessage ? (
        <div className="chat chat-end">
          <div className="chat-image avatar">
            <div className="w-10 rounded-full">
              <img
                alt="User avatar"
                src={user.profileImg || "/avatar-placeholder.png"}
              />
            </div>
          </div>
          {message.text && (
            <div className="chat-bubble">
              {message.text}
              {message.seen ? (
                <BsCheck2All className="w-4 h-4 text-blue-400 font-bold pl-1 inline-block" />
              ) : (
                ""
              )}
            </div>
          )}
          {message.img && !imgLoaded && (
            <div className="mt-5 w-48">
              <img
                src={message.img}
                onLoad={() => setImgLoaded(true)}
                alt="Message image"
                className="hidden rounded-md"
              />
              <div className="w-48 h-48">
                <div className="skeleton bg-gray-300 w-full h-full rounded-md"></div>
              </div>
            </div>
          )}
          {message.img && imgLoaded && (
            <div className="mt-5 w-48">
              <img
                src={message.img}
                alt="Message image"
                className="rounded-md"
              />
              {message.seen ? (
                <BsCheck2All className="w-4 h-4 text-blue-400 font-bold pl-1 inline-block" />
              ) : (
                ""
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="chat chat-start">
          <div className="chat-image avatar">
            <div className="w-10 rounded-full">
              <img
                alt="User avatar"
                src={
                  selectedConversation.userProfileImg ||
                  "/avatar-placeholder.png"
                }
              />
            </div>
          </div>
          {message.text && <div className="chat-bubble">{message.text}</div>}
          {message.img && !imgLoaded && (
            <div className="mt-5 w-48">
              <img
                src={message.img}
                onLoad={() => setImgLoaded(true)}
                alt="Message image"
                className="hidden rounded-md"
              />
              <div className="w-48 h-48">
                <div className="skeleton bg-gray-300 w-full h-full rounded-md"></div>
              </div>
            </div>
          )}
          {message.img && imgLoaded && (
            <div className="mt-5 w-48">
              <img
                src={message.img}
                alt="Message image"
                className="rounded-md"
              />
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Message;
