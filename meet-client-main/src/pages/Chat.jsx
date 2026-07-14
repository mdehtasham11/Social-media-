import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  MessageCircle,
  Search,
  Send,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useRecoilValue } from "recoil";
import LeftHome from "../components/common/LeftHome";
import MobileMenu from "../components/common/MobileMenu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { userSelectorState } from "../store/selector/userSelctor";
import { createChatSocket } from "../utils/chatSocket";
import { getMediaUrl } from "../utils/mediaUrl";

const API_BASE_URL = (
  import.meta.env.VITE_BASE_URL || "http://localhost:8002"
).replace(/\/$/, "");
const MAX_MESSAGE_LENGTH = 1000;

/* ── tiny helpers ─────────────────────────────────────────────── */

const formatTime = (dateString) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatDateLabel = (dateString) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  const now = new Date();
  const diff = now - d;
  const oneDay = 86400000;

  if (diff < oneDay && d.getDate() === now.getDate()) return "Today";
  if (diff < oneDay * 2 && d.getDate() === now.getDate() - 1)
    return "Yesterday";
  return d.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const groupMessagesByDate = (msgs) => {
  const groups = [];
  let lastLabel = "";
  msgs.forEach((m) => {
    const label = formatDateLabel(m.createdAt);
    if (label !== lastLabel) {
      groups.push({ type: "date", label, id: `date-${m._id}` });
      lastLabel = label;
    }
    groups.push({ type: "msg", ...m });
  });
  return groups;
};

/* ── main component ───────────────────────────────────────────── */

const Chat = () => {
  const currentUser = useRecoilValue(userSelectorState);
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [friendSearch, setFriendSearch] = useState("");
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  /* on mobile, toggle between friend-list and chat pane */
  const [showChat, setShowChat] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const selectedFriendRef = useRef(null);
  const currentUserRef = useRef(null);
  const token = useMemo(() => localStorage.getItem("token"), []);

  const selectedFriendInitial = useMemo(
    () => selectedFriend?.userName?.[0]?.toUpperCase() || "U",
    [selectedFriend],
  );

  const filteredFriends = useMemo(() => {
    const query = friendSearch.trim().toLowerCase();
    if (!query) return friends;
    return friends.filter(
      (f) =>
        f.name?.toLowerCase().includes(query) ||
        f.userName?.toLowerCase().includes(query),
    );
  }, [friendSearch, friends]);

  const groupedMessages = useMemo(
    () => groupMessagesByDate(messages),
    [messages],
  );

  useEffect(() => {
    selectedFriendRef.current = selectedFriend;
  }, [selectedFriend]);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  /* ── data fetching ─────────────────────────────────────────── */

  const fetchFriends = useCallback(async () => {
    try {
      setLoadingFriends(true);
      const response = await fetch(`${API_BASE_URL}/api/chat/friends`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        toast.error("Could not load friends");
        return;
      }
      const data = await response.json();
      const friendList = data.data || [];
      setFriends(friendList);
    } catch {
      toast.error("Internal server error");
    } finally {
      setLoadingFriends(false);
    }
  }, [token]);

  const fetchMessages = useCallback(
    async (friendId) => {
      if (!friendId) return;
      try {
        setLoadingMessages(true);
        const response = await fetch(
          `${API_BASE_URL}/api/chat/${friendId}/messages`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        if (!response.ok) {
          toast.error("Could not load messages");
          return;
        }
        const data = await response.json();
        setMessages(data.data || []);
      } catch {
        toast.error("Internal server error");
      } finally {
        setLoadingMessages(false);
      }
    },
    [token],
  );

  const handleSendMessage = async (event) => {
    event.preventDefault();
    const message = draft.trim();
    if (!selectedFriend || !message || message.length > MAX_MESSAGE_LENGTH)
      return;
    try {
      setSending(true);
      const socket = socketRef.current;
      if (!socket?.connected) {
        toast.error("Realtime connection is not ready");
        return;
      }
      socket.emit(
        "chat:send",
        { receiverId: selectedFriend._id, message },
        (response = {}) => {
          if (!response.success) {
            toast.error(response.message || "Could not send message");
            return;
          }
          setDraft("");
        },
      );
    } catch {
      toast.error("Internal server error");
    } finally {
      setSending(false);
    }
  };

  /* ── socket ────────────────────────────────────────────────── */

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  useEffect(() => {
    if (!token) return undefined;
    const socket = createChatSocket(API_BASE_URL, token);
    socketRef.current = socket;

    socket.on("connect", () => setSocketConnected(true));
    socket.on("disconnect", () => setSocketConnected(false));
    socket.on("connect_error", () => {
      setSocketConnected(false);
      toast.error("Could not connect to realtime chat");
    });
    socket.on("chat:error", (error) => {
      toast.error(error?.message || "Realtime chat error");
    });
    socket.on("chat:message", (message) => {
      const activeFriend = selectedFriendRef.current;
      const activeUser = currentUserRef.current;
      if (!activeFriend || !activeUser) return;
      const belongsToOpenThread =
        (message.sender === activeUser._id &&
          message.receiver === activeFriend._id) ||
        (message.sender === activeFriend._id &&
          message.receiver === activeUser._id);
      if (!belongsToOpenThread) return;
      setMessages((current) => {
        if (current.some((item) => item._id === message._id)) return current;
        return [...current, message];
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [currentUser, token]);

  useEffect(() => {
    fetchMessages(selectedFriend?._id);
  }, [fetchMessages, selectedFriend?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ── select a friend (and switch to chat on mobile) ──────── */
  const selectFriend = (friend) => {
    setSelectedFriend(friend);
    setShowChat(true);
  };

  /* ═══════════════════════════════════════════════════════════ */
  /*  RENDER                                                     */
  /* ═══════════════════════════════════════════════════════════ */

  return (
    <div className="relative flex h-screen flex-col bg-zinc-50 text-zinc-950 lg:flex-row">
      <Toaster position="top-right" duration="4000" />
      <LeftHome />

      <main className="mb-16 min-h-0 flex-1 lg:m-3 lg:mb-3">
        <div className="grid h-full grid-cols-1 overflow-hidden lg:grid-cols-[380px_1fr] lg:gap-3">
          {/* ────────────────────────────────────────────────── */}
          {/*  LEFT – FRIEND LIST                                */}
          {/* ────────────────────────────────────────────────── */}
          <section
            className={`flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ${
              showChat ? "hidden lg:flex" : "flex"
            }`}
          >
            {/* header */}
            <div className="px-5 pt-5 pb-3">
              <h1 className="text-2xl font-bold text-zinc-900">Message</h1>

              {/* search */}
              <div className="mt-4 flex h-11 items-center gap-2.5 rounded-xl bg-zinc-100 px-4">
                <Search size={17} className="text-zinc-400" />
                <input
                  value={friendSearch}
                  onChange={(e) => setFriendSearch(e.target.value)}
                  placeholder="Search"
                  className="h-full flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
                />
              </div>
            </div>

            {/* horizontal avatar strip */}
            {friends.length > 0 && (
              <div className="flex gap-4 overflow-x-auto px-5 py-3 no-scrollbar">
                {friends.slice(0, 10).map((f) => (
                  <button
                    key={f._id}
                    type="button"
                    onClick={() => selectFriend(f)}
                    className="flex flex-col items-center gap-1.5 shrink-0 bg-white rounded-lg hover:bg-zinc-100 cursor-pointer"
                  >
                    <div className="relative">
                      <div
                        className={`rounded-full p-[2.5px] ${
                          selectedFriend?._id === f._id
                            ? "bg-zinc-900"
                            : "bg-zinc-200"
                        }`}
                      >
                        <Avatar className="h-14 w-14 border-2 border-white">
                          <AvatarImage
                            src={getMediaUrl(f.profile)}
                            alt={f.userName}
                          />
                          <AvatarFallback className="bg-zinc-100 text-zinc-600 font-semibold">
                            {f.userName?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      {/* online dot */}
                      <span className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400" />
                    </div>
                    <span className="max-w-[60px] truncate text-[11px] font-medium text-zinc-600">
                      {f.name?.split(" ")[0]}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* tabs */}
            <div className="flex gap-2 px-5 pb-2">
              <span className="rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-semibold text-white">
                All
              </span>
              <span className="rounded-full bg-zinc-100 px-4 py-1.5 text-xs font-semibold text-zinc-500 cursor-pointer hover:bg-zinc-200 transition">
                Unread
              </span>
            </div>

            {/* friend conversation list */}
            <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar bg-white hover:bg-zinc-100 cursor-pointer">
              {loadingFriends ? (
                <div className="space-y-2 p-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-xl p-3"
                    >
                      <div className="h-14 w-14 animate-pulse rounded-full bg-zinc-100" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3.5 w-28 animate-pulse rounded-full bg-zinc-100" />
                        <div className="h-3 w-40 animate-pulse rounded-full bg-zinc-100" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : friends.length === 0 ? (
                <div className="flex h-full min-h-[180px] flex-col items-center justify-center px-6 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100">
                    <MessageCircle size={32} className="text-zinc-400" />
                  </div>
                  <p className="mt-4 font-semibold text-zinc-800">
                    No conversations yet
                  </p>
                  <p className="mt-1 text-sm text-zinc-500">
                    Add friends to start chatting.
                  </p>
                </div>
              ) : filteredFriends.length === 0 ? (
                <p className="p-5 text-center text-sm text-zinc-500">
                  No friends match your search.
                </p>
              ) : (
                filteredFriends.map((friend) => {
                  const isActive = selectedFriend?._id === friend._id;
                  return (
                    <button
                      key={friend._id}
                      type="button"
                      onClick={() => selectFriend(friend)}
                      className={`group flex w-full items-center gap-3 px-5 py-3.5 text-left transition-all duration-150 bg-white ${
                        isActive ? "bg-zinc-100" : "hover:bg-zinc-50"
                      }`}
                    >
                      <div className="relative shrink-0">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={getMediaUrl(friend.profile)}
                            alt={friend.userName}
                          />
                          <AvatarFallback className="bg-zinc-100 text-zinc-600 font-semibold text-base">
                            {friend.userName?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-bold text-zinc-900">
                            {friend.name}
                          </p>
                          <span className="shrink-0 text-[11px] font-medium text-zinc-400">
                            Just now
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-[13px] text-zinc-500">
                          @{friend.userName}
                        </p>
                      </div>

                      <ChevronRight
                        size={16}
                        className="shrink-0 text-zinc-300 opacity-0 transition group-hover:opacity-100"
                      />
                    </button>
                  );
                })
              )}
            </div>

            {/* status pill */}
            <div className="flex items-center justify-center gap-2 border-t border-zinc-100 py-3">
              <span
                className={`h-2 w-2 rounded-full ${
                  socketConnected ? "bg-emerald-400" : "bg-zinc-300"
                }`}
              />
              <span className="text-xs text-zinc-400">
                {socketConnected ? "Connected" : "Connecting…"}
              </span>
            </div>
          </section>

          {/* ────────────────────────────────────────────────── */}
          {/*  RIGHT – CHAT PANE                                 */}
          {/* ────────────────────────────────────────────────── */}
          <section
            className={`flex min-h-0 flex-col overflow-hidden rounded-2xl bg-white shadow-sm ${
              !showChat ? "hidden lg:flex" : "flex"
            }`}
          >
            {selectedFriend ? (
              <>
                {/* ── chat header ──────────────────────────── */}
                <div className="flex h-[72px] items-center gap-3 border-b border-zinc-100 px-4">
                  {/* back button (mobile) */}
                  <button
                    type="button"
                    onClick={() => setShowChat(false)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-zinc-700 hover:bg-zinc-100 lg:hidden"
                  >
                    <ArrowLeft size={22} />
                  </button>

                  <Avatar className="h-11 w-11 shrink-0">
                    <AvatarImage
                      src={getMediaUrl(selectedFriend.profile)}
                      alt={selectedFriend.userName}
                    />
                    <AvatarFallback className="bg-zinc-100 text-zinc-600 font-semibold">
                      {selectedFriendInitial}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-bold text-zinc-900">
                      {selectedFriend.name}
                    </p>
                    <p className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Active now
                    </p>
                  </div>
                </div>

                {/* ── messages area ────────────────────────── */}
                <div className="min-h-0 flex-1 overflow-y-auto bg-zinc-50 px-4 py-5">
                  {/* profile card at top */}
                  <div className="mb-6 flex flex-col items-center text-center">
                    <div className="rounded-full bg-zinc-900 p-[3px]">
                      <Avatar className="h-20 w-20 border-[3px] border-white">
                        <AvatarImage
                          src={getMediaUrl(selectedFriend.profile)}
                          alt={selectedFriend.userName}
                        />
                        <AvatarFallback className="bg-zinc-100 text-zinc-600 text-xl font-bold">
                          {selectedFriendInitial}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <p className="mt-2.5 text-base font-bold text-zinc-900">
                      {selectedFriend.name}
                    </p>
                    <p className="text-xs text-zinc-400">
                      @{selectedFriend.userName}
                    </p>
                  </div>

                  {loadingMessages ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`h-10 w-48 animate-pulse rounded-2xl ${
                            i % 2 === 0 ? "ml-auto bg-zinc-200" : "bg-zinc-100"
                          }`}
                        />
                      ))}
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex justify-center">
                      <p className="rounded-full bg-white px-5 py-2 text-sm text-zinc-400 shadow-sm">
                        Say hello 👋
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {groupedMessages.map((item) => {
                        if (item.type === "date") {
                          return (
                            <div
                              key={item.id}
                              className="flex justify-center py-3"
                            >
                              <span className="rounded-full bg-white px-4 py-1 text-[11px] font-semibold text-zinc-400 shadow-sm">
                                {item.label}
                              </span>
                            </div>
                          );
                        }

                        const mine = item.sender === currentUser?._id;
                        return (
                          <div
                            key={item._id}
                            className={`flex ${mine ? "justify-end" : "justify-start"}`}
                          >
                            <div className="flex flex-col max-w-[75%]">
                              <div
                                className={`rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed transition-all ${
                                  mine
                                    ? "rounded-br-md bg-zinc-900 text-white"
                                    : "rounded-bl-md bg-white text-zinc-800 shadow-sm"
                                }`}
                              >
                                <p className="whitespace-pre-wrap break-words">
                                  {item.message}
                                </p>
                              </div>
                              <span
                                className={`mt-1 text-[10px] text-zinc-400 ${
                                  mine ? "text-right" : "text-left"
                                }`}
                              >
                                {formatTime(item.createdAt)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* ── message input ────────────────────────── */}
                <form
                  onSubmit={handleSendMessage}
                  className="bg-white px-5 py-3"
                >
                  <div className="flex items-end gap-3 border-b border-zinc-200 pb-2 focus-within:border-zinc-400 transition-colors">
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      maxLength={MAX_MESSAGE_LENGTH}
                      rows={1}
                      placeholder="Type a message…"
                      className="max-h-20 min-h-[24px] flex-1 resize-none bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
                    />
                    <button
                      type="submit"
                      disabled={
                        sending ||
                        !draft.trim() ||
                        draft.trim().length > MAX_MESSAGE_LENGTH
                      }
                      className={`mb-0.5 p-1 transition-all duration-200 bg-white cursor-pointer active:scale-75 ${
                        draft.trim()
                          ? "text-zinc-900 hover:text-zinc-600"
                          : "text-zinc-200 pointer-events-none"
                      }`}
                      title="Send"
                    >
                      <Send
                        size={18}
                        strokeWidth={2}
                        className="bg-blue cursor-pointer text-blue-600"
                      />
                    </button>
                  </div>
                  {draft.length > MAX_MESSAGE_LENGTH * 0.85 && (
                    <p className="mt-1.5 text-right text-[11px] text-zinc-400">
                      {draft.length}/{MAX_MESSAGE_LENGTH}
                    </p>
                  )}
                </form>
              </>
            ) : (
              /* ── empty state ────────────────────────────── */
              <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-zinc-100">
                  <MessageCircle
                    size={48}
                    strokeWidth={1.5}
                    className="text-zinc-400"
                  />
                </div>
                <p className="mt-5 text-xl font-bold text-zinc-800">
                  Your Messages
                </p>
                <p className="mt-2 max-w-xs text-sm text-zinc-500">
                  Send private photos and messages to a friend.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>

      <MobileMenu />
    </div>
  );
};

export default Chat;
