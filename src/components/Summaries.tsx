"use client";
import { useState } from "react";
import Image from "next/image";


export default function Summaries({ summary, chapters, questions }: { summary: string, chapters: string, questions: string }) {
  const [QAModalOpen, setQAModalOpen] = useState(false);
  const summaries = [
    {
      name: "Summary",
      content: summary || ""
    },
    {
      name: "Chapters and Topics",
      content: chapters || ""
    },
    {
      name: "Key Questions",
      content: questions || ""
    },
    {
      name: "Notes",
      content:  ""
    },
  ];

  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({});

  // Function to toggle the expanded state of an item
  const toggleSummary = (itemName: string) => {
    setExpandedItems(prevState => ({
      ...prevState,
      [itemName]: !prevState[itemName]
    }));
  };
  return (
    <div>
      <ul
        role="list"
        className="min-w-screen w-full m-auto grid grid-cols-1 gap-6 lg:grid-cols-2"
      >
        {summaries.map((summary, i) => (
          <li
            key={summary.name}
            className="col-span-1 flex flex-col rounded-lg bg-slate-800  text-center shadow relative ring-1 ring-white/10 cursor-pointer hover:ring-sky-300/70 transition"
          >
            <div className="absolute -bottom-px left-10 right-10 h-px bg-gradient-to-r from-sky-300/0 via-sky-300/70 to-sky-300/0"></div>
            <div className="flex flex-1 flex-col p-1">
              
              <h3 className="mt-2 text-sm font-medium text-white ">
                {summary.name}
              </h3>
              <dl className="mt-1 flex flex-grow flex-col justify-between">
                <dt className="sr-only"></dt>

              <dd className="text-sm text-slate-400">
              {expandedItems[summary.name] ? summary.content : summary.content.slice(0, 1000)}
              {summary.name == "Notes" ? (
                <textarea
                  className="w-full h-full p-10 bg-slate-800 text-white placeholder-slate-400"
                  placeholder="Jot your own notes here"
                />
              ) : (
                <></>
              )}
              <button
                onClick={() => toggleSummary(summary.name)}
                className="mt-2 text-sm text-sky-500 hover:underline"
                style={{ position: 'relative', zIndex: 1000 }}
              >
                {expandedItems[summary.name] ? 'Show Less' : 'Show More'}
              </button>
            </dd>
              </dl>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
