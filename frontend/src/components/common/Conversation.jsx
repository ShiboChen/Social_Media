import { BsCheck2All, BsFillImageFill } from "react-icons/bs";
import { useQuery } from "@tanstack/react-query";
import { useRecoilState, useRecoilValue } from "recoil";
import { selectedConversationAtom } from "../../atoms/messagesAtom";

const Conversation = ({ conversation, isOnline }) => {
  const { data: currentUser } = useQuery({ queryKey: ["authUser"] });
  const user = conversation.participants[0];
  const lastMessage = conversation.lastMessage;
  const [selectedConversation, setSelectedConversation] = useRecoilState(selectedConversationAtom);

  return (
    <div
      className={`flex gap-4 items-center p-1 ${
        selectedConversation?._id === conversation._id ? "bg-gray-600" : ""
      } rounded-md cursor-pointer`}
      onClick={() =>
        setSelectedConversation({
          _id: conversation._id,
          userId: user._id,
          userProfileImg: user.profileImg,
          username: user.username,
          mock: conversation.mock,
        })
      }
    >
      <div className="flex-shrink-0">
        <img
          className="w-10 h-10 rounded-full"
          src={user.profileImg || '/avatar-placeholder.png'}
          alt={`${user.username}'s profile`}
        />
        {isOnline && (
          <span className="absolute bottom-0 right-0 inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
        )}
      </div>
      <div className="flex flex-col text-sm">
        <div className="font-bold flex items-center">
          {user.username}{" "}
        </div>
        <div className="flex items-center text-xs gap-1">
          {currentUser._id === lastMessage.sender && (
            <span
              className={`box-content ${
                lastMessage.seen ? "text-blue-600" : ""
              }`}
            >
              <BsCheck2All className="w-[16px] h-[16px]" />
            </span>
          )}
          {lastMessage.text.length > 18
            ? `${lastMessage.text.substring(0, 18)}...`
            : lastMessage.text || (
                <BsFillImageFill className="w-[16px] h-[16px]" />
              )}
        </div>
      </div>
    </div>
  );
};

export default Conversation;
