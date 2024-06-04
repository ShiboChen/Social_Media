import { useRef, useState } from "react";
import { IoSendSharp } from "react-icons/io5";
import {
  conversationsAtom,
  selectedConversationAtom,
} from "../../atoms/messagesAtom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { BsFillImageFill } from "react-icons/bs";
import { toast } from "react-hot-toast";

const MessageInput = ({ setMessages }) => {
  const [messageText, setMessageText] = useState("");
  const selectedConversation = useRecoilValue(selectedConversationAtom);
  const setConversations = useSetRecoilState(conversationsAtom);
  const [imgUrl, setImgUrl] = useState(null);
  const imageRef = useRef(null);
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText && !imgUrl) return;
    if (isSending) return;
    setIsSending(true);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageText,
          recipientId: selectedConversation.userId,
          img: imgUrl,
        }),
      });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
        return;
      }
      console.log(data);
      setMessages((messages) => [...messages, data]);

      setConversations((prevConvs) => {
        const updatedConversations = prevConvs.map((conversation) => {
          if (conversation._id === selectedConversation._id) {
            return {
              ...conversation,
              lastMessage: {
                text: messageText,
                sender: data.sender,
              },
            };
          }
          return conversation;
        });
        return updatedConversations;
      });
      setMessageText("");
      setImgUrl("");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleImgChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setImgUrl(reader.result);
      };

      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <form class="border-t border-gray-300 p-4" onSubmit={handleSendMessage}>
        <div class="flex items-center">
          <input
            type="text"
            placeholder="Type a message..."
            onChange={(e) => setMessageText(e.target.value)}
            value={messageText}
            class="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            className="ml-4 bg-blue-500 text-white px-4 py-2 rounded-lg text-xl"
            onClick={() => {
              if(!imgUrl) return;
              imageRef.current.click();
            }}
          >
            <BsFillImageFill />
            <input
              type="file"
              accept="image/*"
              hidden
              ref={imageRef}
              onChange={handleImgChange}
            />
          </button>
          <button
            class="ml-4 bg-blue-500 text-white px-4 py-2 rounded-lg text-xl"
            onSubmit={handleSendMessage}
          >
            <IoSendSharp />
          </button>
        </div>
      </form>
      {imgUrl && document.getElementById("preview_image_modal").showModal()}
      <dialog id="preview_image_modal" className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => {
                setImgUrl(null);
                imageRef.current.value = null;
              }}
            >
              ✕
            </button>
          </form>
          <img
            src={imgUrl}
            className="w-full mx-auto h-72 object-contain rounded"
          />
          <div className="flex justify-end">
            <button
              className="ml-4 bg-blue-500 text-white px-4 py-2 rounded-lg text-xl"
              onSubmit={handleSendMessage}
            >
              <IoSendSharp />
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default MessageInput;
