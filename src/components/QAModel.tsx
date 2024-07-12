"use client"
import { Fragment, useState,useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
// import { useChat } from "ai/react";
import axios from 'axios';
import Examples from "./Examples";
import React from 'react';
import { OpenAI } from 'openai';
import ChatInterface from "./ChatInterface";

export default function QAModal() {
//   const { completion, input, isLoading, handleInputChange, handleSubmit } = useChat()  
  // useCompletion({
    //   api: "/api/qa-pg-vector",
    // });
    const [name, setName] = useState("Attention is All You Need")
    const [input, setInput] = useState("")
    const [transcript, setTranscript] = useState("")
    const [summary, setSummary] = useState("")
    const [chapters, setChapters] = useState("")
    const [questions, setQuestions] = useState("")
    const [open, setOpen] = useState(false)

    function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
      setInput(event.target.value);
    }

    async function fetchSummary(videoId:string | null) {
        try {
          const response = await axios.get(`http://localhost:3001/api/getSummary?videoId=${videoId}`);
          console.log(response)
          return response.data
        } catch (error) {
          console.error('Error fetching transcript:', error);
        }
      }
    
    async function fetchChapters(videoId:string | null) {
        try {
            const response = await axios.get(`http://localhost:3001/api/getChapters?videoId=${videoId}`);
            console.log(response)
            return response.data
        } catch (error) {
            console.error('Error fetching transcript:', error);
        }
    }

    async function fetchQuestions(videoId:string | null) {
        try {
          const response = await axios.get(`http://localhost:3001/api/getQuestions?videoId=${videoId}`);
          console.log(response)
          return response.data
        } catch (error) {
          console.error('Error fetching transcript:', error);
        }
      }

    const handleSubmitVideo = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      try {
        //generate summaries
        const videoId = extractVideoId(input);
        const summary  = await fetchSummary(videoId)
        setSummary(summary)
        const chapters  = await fetchChapters(videoId)
        setChapters(chapters)
        const questions  = await fetchQuestions(videoId)
        setQuestions(questions)

      } catch (error) {
        console.error('Error submitting question:', error);
      }
    };

    useEffect(() => {
        getYouTubeVideoTitle(input)
          .then(title => setName(title))
          .catch(error => console.error('Error:', error));
      }, [input]); 
      
      async function getYouTubeVideoTitle(url: string): Promise<string> {
        const videoId = extractVideoId(url);
        
        try {
          if (!videoId) {
            throw new Error('Invalid YouTube URL');
          }
          // Rest of your code...
        } catch (error) {
          console.error('Error:', error);
          // Handle the error state appropriately here
          // For example, you could update the state to show an error message
          // or you could return a default value.
        }
      
        const apiUrl = `http://localhost:3001/api/videoTitle?videoId=${videoId}`;
      
        try {
          const response = await axios.get(apiUrl);
          const videoData = response.data;
      
          return videoData.title;
        } catch (error) {
          console.error('Error fetching video data:', error);
          throw error;
        }
      }
      function extractVideoId(url: string): string | null {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7].length === 11) ? match[7] : null;
      }
  return (
    <>
      <div className="bg-slate-800 p-4 mt-5 rounded">
                  <form onSubmit={handleSubmitVideo}>
                    <input
                      placeholder="https://www.youtube.com/watch?v=iDulhoQ2pro"
                      className="w-full flex-auto rounded-md border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm focus:outline-none  sm:text-sm sm:leading-6"
                      value={input}
                      onChange={handleInputChange}
                    />
                  </form>
                  <div className="mt-3 sm:mt-5">
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Ask questions about{" "}
                        <a
                          href={input || "https://www.youtube.com/watch?v=iDulhoQ2pro"}
                          className="underline"
                        >
                          {name}
                        </a>
                        <button
                          onClick={() => setOpen(true)}
                          className="ml-4 rounded-md bg-sky-500 px-4 py-1 text-sm font-medium text-white shadow hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                        >
                          Click to Chat
                        </button>
                        <ChatInterface
                          open={open}
                          setOpen={setOpen}
                        />
                      </p>
                    </div>
                    {/* {completion && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-200">{completion}</p>
                      </div>
                    )}

                    {isLoading && !completion && (
                      <p className="flex items-center justify-center mt-4">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      </p>
                    )} */}
                  </div>
                </div>
            
      
      <div className="mt-10 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 16em)' }}>
      <Examples summary={summary} chapters={chapters} questions={questions}/>
      </div>
    
    </>
  );
}
