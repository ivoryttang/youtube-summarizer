"use client"
import { Fragment, useState,useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
// import { useChat } from "ai/react";
import axios from 'axios';
import Examples from "./Examples";
import React from 'react';
import { OpenAI } from 'openai';

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
        
        if (!videoId) {
          throw new Error('Invalid YouTube URL');
        }
      
        // const apiUrl = `/api/videoTitle?videoId=${videoId}`;
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
    <Transition.Root show={true} as={Fragment}>
      <Dialog as="div" onClose={() => {}} className="relative" >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="bg-gray-95 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-x-0 top-[15rem]">
          <div className="flex items-end justify-center p-2 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:p-3 w-full max-w-3xl">
                <div>
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
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
        
      </Dialog>
      <div className="mt-32 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 16em)' }}>
      <Examples summary={summary} chapters={chapters} questions={questions}/>
      </div>
    </Transition.Root>
    
    
  );
}
