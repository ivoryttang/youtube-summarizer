"use client"
import { useState,useEffect } from "react";
import axios from 'axios';
import Summaries from "./Summaries";
import React from 'react';
import ChatInterface from "./ChatInterface";

export default function QAModal() {
    const [name, setName] = useState("Attention is All You Need")
    const [input, setInput] = useState("")
    const [summary, setSummary] = useState("")
    const [chapters, setChapters] = useState("")
    const [questions, setQuestions] = useState("")
    const [open, setOpen] = useState(false)

    function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
      setInput(event.target.value);
    }

    async function fetchSummary(videoId:string | null) {
        try {
          const response = await axios.get(`http://localhost:3001/youtube/getSummary?videoId=${videoId}`);
          console.log(response)
          return response.data
        } catch (error) {
          console.error('Error fetching transcript:', error);
        }
      }
    
    async function fetchChapters(videoId:string | null) {
        try {
            const response = await axios.get(`http://localhost:3001/youtube/getChapters?videoId=${videoId}`);
            console.log(response)
            return response.data
        } catch (error) {
            console.error('Error fetching transcript:', error);
        }
    }

    async function fetchQuestions(videoId:string | null) {
        try {
          const response = await axios.get(`http://localhost:3001/youtube/getQuestions?videoId=${videoId}`);
          console.log(response)
          return response.data
        } catch (error) {
          console.error('Error fetching transcript:', error);
        }
      }

    async function embedVideoContent(videoId:string | null) {
        try {
          console.log("embeddings generating")
          const embedResponse = await axios.post(`http://localhost:3001/chat/process-docs?videoId=${videoId}`);
          console.log(embedResponse.data);
        } catch (error) {
          console.error('Error embedding:', error);
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
        embedVideoContent(videoId)
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
        } catch (error) {
          console.error('Error:', error);
        }
      
        const apiUrl = `http://localhost:3001/youtube/videoTitle?videoId=${videoId}`;
      
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
                  </div>
                </div>
            
      
      <div className="mt-10 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 16em)' }}>
      <Summaries summary={summary} chapters={chapters} questions={questions}/>
      </div>
    
    </>
  );
}
