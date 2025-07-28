import React from "react";
import Image from "next/image";

const contacts = [
  {
    name: "Person 1",
    avatar: null,
    active: false,
  },
  {
    name: "Person2",
    avatar: null, // Replace with actual image or null
    active: false,
  },
  {
    name: "Person3",
    avatar: null, // Replace with actual image or null
    active: true,
    lastSeen: "1h",
  },
];

export const ChatSidebar = () => {
  return (
    <aside className="w-80 bg-gray-50 border-l border-gray-200 h-screen flex flex-col">
      <div className="px-4 py-4 border-b border-gray-200 flex items-center justify-between">
        <span className="text-lg font-semibold text-gray-700">Contacts</span>
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            className="bg-gray-100 rounded-full px-3 py-1 text-sm focus:outline-none border border-gray-200"
            style={{ width: 90 }}
            disabled
          />
        </div>
        <button className="ml-2 text-gray-400 hover:text-gray-600">
          <svg
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
            <circle cx="5" cy="12" r="2" />
          </svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {contacts.map((contact, idx) => (
          <div
            key={contact.name}
            className={`flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100 rounded-lg transition ${
              idx === 1 ? "bg-gray-200" : ""
            }`}
          >
            {contact.avatar ? (
              <Image
                src={contact.avatar}
                alt={contact.name}
                width={36}
                height={36}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-gray-500 text-lg font-bold">
                {contact.name[0]}
              </div>
            )}
            <div className="ml-3 flex-1">
              <div className="text-sm font-medium text-gray-800">
                {contact.name}
              </div>
              {contact.lastSeen && (
                <div className="text-xs text-gray-400">{contact.lastSeen}</div>
              )}
            </div>
            {contact.active && !contact.lastSeen && (
              <span className="w-2 h-2 bg-green-400 rounded-full ml-2" />
            )}
          </div>
        ))}
        <div className="mt-6">
          <div className="text-xs text-gray-500 px-4 mb-2">Group chats</div>
          <button className="flex items-center px-4 py-2 hover:bg-gray-100 rounded-lg w-full text-left text-gray-700">
            <span className="mr-2 text-lg">+</span> Create group chat
          </button>
        </div>
      </div>
      <div className="p-4 border-t border-gray-200 flex justify-end">
        <button className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 shadow">
          <svg
            width="22"
            height="22"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>
    </aside>
  );
};
