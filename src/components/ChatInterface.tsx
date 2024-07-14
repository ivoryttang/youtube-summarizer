import { Fragment, useState, useEffect, useRef, useCallback  } from "react";
import { Transition, Dialog } from '@headlessui/react';
import { useCompletion } from "ai/react";
import axios from "axios";


export default function ChatInterface({
  open,
  setOpen
}: {
  open: boolean;
  setOpen: any
}) {
  const { completion, input, isLoading, handleInputChange, handleSubmit } =
    useCompletion({
      api: "http://localhost:3001/chat/vector-qa",
    });
    const [isAudioPlayed, setIsAudioPlayed] = useState(false);
    const [play, setPlay] = useState(false);

    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<AudioBufferSourceNode | null>(null);


    const playAudio = useCallback(async (audioData: Uint8Array) => {
        console.log("playAudio called with data length:", audioData.length);
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new AudioContext();
              }
          
              if (audioContextRef.current.state === 'suspended') {
                await audioContextRef.current.resume();
              }
              
              const audioBuffer = processAudioData(audioData, 44100);
              sourceRef.current = audioContextRef.current.createBufferSource();
              sourceRef.current.buffer = audioBuffer;
              sourceRef.current.connect(audioContextRef.current.destination);
          
              sourceRef.current.onended = () => {
                setIsAudioPlayed(false);
                cleanup();
              };
          
              sourceRef.current.start();
              console.log("Audio playback started");
        } catch (err) {
          console.error('Error playing audio:', err);
          cleanup();
        }
      }, [isAudioPlayed]);

    
      
    const fetchTTSData = async () => {
        console.log("HEREEE",completion)
        
        
        try {
                const apiUrl = `http://localhost:3001/chat/tts?transcript=${completion}`;
                const response = await axios.post(apiUrl);
                
                const audioDataArray = Object.values(response.data).map(Number);
                const audioData = new Uint8Array(audioDataArray);
                await playAudio(audioData)
          } catch (err) {
            console.error('Error fetching TTS data:', err);
            cleanup();
          }
      };
      
      const processAudioData = (audioData: Uint8Array, sampleRate = 44100) => {
        if (!audioContextRef.current) {
          audioContextRef.current = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
        }
        const audioBuffer = audioContextRef.current.createBuffer(1, audioData.length / 4, sampleRate);
        const channelData = audioBuffer.getChannelData(0);
      
        const float32Array = new Float32Array(audioData.buffer);
        channelData.set(float32Array);
      
        return audioBuffer;
      };
      
      
      
      const cleanup = () => {
        if (sourceRef.current) {
          sourceRef.current.onended = null;
          sourceRef.current.stop();
          sourceRef.current.disconnect();
          sourceRef.current = null;
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
        setIsAudioPlayed(false);
      };
      
      useEffect(() => {
        return () => {
          cleanup();
        };
      }, []);
    



  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-950 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:p-6 w-full max-w-3xl">
                <div>
                <form onSubmit={handleSubmit}>
                  <input
                    className="w-full flex-auto rounded-md border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm focus:outline-none  sm:text-sm sm:leading-6"
                    placeholder="Ask a question about your video"
                    value={input}
                    onChange={handleInputChange}
                  ></input>
                  </form>
                  <div className="mt-3">
                    <div className="my-2">
                      <p className="text-sm text-gray-500">
                        Powered by GPT-4 and Cartesia TTS <button onClick={()=> {fetchTTSData();  setPlay(!play)}} className="ml-2 hover:underline">{play ? <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-4">
  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
</svg> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-4">
  <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
</svg> }
</button>
                      </p>
                    </div>
                  </div>
                </div>
                {completion && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-200">{completion}</p>
                      </div>
                )}
                    
                {isLoading && (
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
                )}
                
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
